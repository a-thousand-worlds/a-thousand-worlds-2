const admin = require('firebase-admin')
const axios = require('axios')
const { google } = require('googleapis')
const { JWT } = require('google-auth-library')
const key = require('../serviceAccountKey.json')
const zlib = require('zlib')
const crypto = require('crypto')

/** Creates authorized client for googleapi calls */
const getAuthorizedClient = () => new JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ['https://www.googleapis.com/auth/firebase.hosting']
})

/** loading firebase website "collection" */
const loadCollection = (db, path) => {
  return new Promise((resolve, reject) => {
    const ref = db.ref(path)
    ref.once('value', snap => {
      const collection = snap.val()
      resolve(collection)
    })
  })
}

/** load required database collection and collect them into cached structure */
const cacheDatabase = async db => {
  const books = await loadCollection(db, 'books')
  const tagsBooks = await loadCollection(db, 'tags/books')
  const tagsPeople = await loadCollection(db, 'tags/people')
  const tagsBundles = await loadCollection(db, 'tags/bundles')
  const people = await loadCollection(db, 'people')
  const users = await loadCollection(db, 'users')
  const contributors = Object.values(users).filter(user => user.roles && (user.roles.contributor || user.roles.owner))
  const content = await loadCollection(db, 'content')

  return {
    books,
    people,
    tags: {
      books: tagsBooks,
      people: tagsPeople,
      bundles: tagsBundles
    },
    contributors,
    content
  }
}

/** gzip and hash entry buffer */
const gzipAndHash = buff => new Promise((resolve, reject) => {
  zlib.gzip(buff, { level: 9 }, (err, res) => {
    if (err) {
      reject(err)
      return
    }
    const hasher = crypto.createHash('sha256')
    hasher.update(res)
    resolve({
      gzip: res,
      hash: hasher.digest('hex')
    })
  })
})

/** clear not finalized versions - may happens if previous caching failed (and usefull for development */
const clearNotFinalizedVersions = async (api, site) => {
  const req = await api.sites.versions.list({
    parent: site.name,
    filter: 'status="CREATED"'
  })
  if (!Array.isArray(req.data.versions) || !req.data.versions.length) return
  console.log('not finalized versions: ', req.data.versions)
  const all = req.data.versions.map(version => api.sites.versions.delete({ name: version.name }))
  return await Promise.all(all)
}

/** main working function */
const rebuildCache = async () => {
  const client = getAuthorizedClient()
  // console.log('auth client', client)

  const api = google.firebasehosting({
    version: 'v1beta1',
    auth: client
  })

  console.log(`requiesting sites for project <${key.project_id}>`)
  const reqSites = await api.projects.sites.list({
    parent: `projects/${key.project_id}`
  })
  if (!reqSites.data.sites || !Array.isArray(reqSites.data.sites) || !reqSites.data.sites.length) {
    console.error('Sites not found!')
    return null
  }
  const site = reqSites.data.sites[0]

  await clearNotFinalizedVersions(api, site)

  console.log(`requiesting releases for site <${site.name}>`)
  const reqReleases = await api.sites.releases.list({
    parent: site.name
  })
  if (!reqReleases.data.releases || !Array.isArray(reqReleases.data.releases) || !reqReleases.data.releases.length) {
    console.error('Releases not found!')
    return null
  }
  const release = reqReleases.data.releases.find(r => r.version.status === 'FINALIZED')
  if (!release) {
    console.error('Finalized release not found!')
    return null
  }

  await api.sites.versions.clone({
    parent: site.name,
    requestBody: {
      sourceVersion: release.version.name,
      finalize: false,
      exclude: {
        regexes: ['dbcache.js']
      }
    }
  })

  // TODO: In a perfect way here we need request operation status and wait it to be done
  // but version cloning goes fast and ready on next step already

  const versionsReq = await api.sites.versions.list({
    parent: site.name,
    filter: 'status="CREATED"'
  })
  if (!versionsReq.data.versions || !Array.isArray(versionsReq.data.versions) || !versionsReq.data.versions.length) {
    console.error('created version not found! exiting')
    return null
  }
  const nextVersion = versionsReq.data.versions[0]
  let updateSuccess = true

  const newFiles = {}
  const hashMap = {}

  const db = await cacheDatabase(admin.database())
  db.cacheDate = new Date()

  // collect books covers to cache
  const cacheBooks = Object.values(db.books).map(book => {
    if (!book || !book.cover || !book.cover.url) return null
    // TODO: to be fully correct here need compare existing cache with downloaded file
    return book
  }).filter(x => !!x)

  await Promise.all(cacheBooks.map(book => {
    // updating cached db cuz we need calculate later hash of file with cached urls
    const cacheUrl = `/img/${book.id}.png`
    db.books[book.id].cover.cache = cacheUrl
    console.log(`downloading book cover <${book.title}> id: <${book.id}>`)
    return axios.get(book.cover.url, { responseType: 'arraybuffer' })
      .then(res => gzipAndHash(Buffer.from(res.data)))
      .then(gzip => {
        newFiles[cacheUrl] = gzip
        hashMap[cacheUrl] = gzip.hash
      })
  }))

  const dbCacheJs = `window.dbcache = ${JSON.stringify(db)}`
  newFiles['/dbcache.js'] = await gzipAndHash(Buffer.from(dbCacheJs))
  hashMap['/dbcache.js'] = newFiles['/dbcache.js'].hash

  const uploadInfoReq = await api.sites.versions.populateFiles({
    parent: nextVersion.name,
    requestBody: {
      files: hashMap
    }
  })
  const uploadInfo = uploadInfoReq.data

  // uploading files
  const uploads = await Promise.all(Object.values(newFiles).map(gzip => client.request({
    url: uploadInfo.uploadUrl + '/' + gzip.hash,
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: gzip.gzip,
    auth: true
  }).catch(err => {
    console.log('upload error!', gzip.hash, err)
  })))

  if (uploads.find(up => up.status !== 200)) {
    console.error('Upload files failed')
    updateSuccess = false
  }
  else {
    console.log('New files uploaded')
  }

  if (!updateSuccess) {
    console.log(`removing nextVersion <${nextVersion.name}>`)
    await api.sites.versions.delete({ name: nextVersion.name })
    return null
  }

  console.log(`finalizing and releasing verion <${nextVersion.name}>`)
  const patchReq = await api.sites.versions.patch({
    name: nextVersion.name,
    updateMask: 'status',
    requestBody: {
      status: 'FINALIZED'
    }
  })
  if (patchReq.status !== 200) {
    console.log(`finalization failed. removing nextVersion <${nextVersion.name}>`)
    await api.sites.versions.delete({ name: nextVersion.name })
    return null
  }

  console.log(`releasing version <${nextVersion.name}>`)
  const nextReleaseReq = await api.sites.releases.create({
    parent: site.name,
    versionName: nextVersion.name
  })
  console.log(`released <${nextReleaseReq.data.name}>`)

  if (cacheBooks.length) {
    console.log('updating database with cached cover url')
    await Promise.all(cacheBooks.map(book => {
      const ref = admin.database().ref(`books/${book.id}/cover/cache`)
      return ref.set(`/img/${book.id}.png`)
    }))
    console.log('database updated')
  }

  console.log('cache done')

  return true
}

module.exports = rebuildCache
