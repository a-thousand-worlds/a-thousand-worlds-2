const promptly = require('promptly')
const axios = require('axios')
const fs = require('fs')

const envFile = process.argv[process.argv.length - 1]

if (envFile.endsWith('update-dbcache.js')) {
  console.log('Ussage: npm run update:localcache PATH_TO_ENV_FILE')
  process.exit(0)
}

require('dotenv').config({ path: envFile })
console.log(`using firebase config from <${envFile}>`)

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

/** Firebase initialization */
const initFirebase = () => {
  const firebase = require('firebase/app')
  require('firebase/auth')
  require('firebase/database')
  const firebaseConfig = {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VUE_APP_FIREBASE_APP_ID,
    measurementId: process.env.VUE_APP_FIREBASE_MEASURMENT_ID
  }
  firebase.initializeApp(firebaseConfig)
  return firebase
}

/** Main function */
const go = async () => {
  console.log('Initializing firebase')
  const usr = await promptly.prompt(`Website owner authentication email`)
  const pwd = await promptly.password(`Website owner authentication password for <${usr}>`)
  console.log('Connecting to firebase')
  const firebase = initFirebase()
  let credentials = null
  try {
    credentials = await firebase.auth().signInWithEmailAndPassword(usr, pwd)
  }
  catch (err) {
    credentials = null
  }
  if (!credentials) {
    console.log('Firebase authentication error. Nothing done. Aborting')
    return
  }
  console.log(`Authorized as <${credentials.user.displayName} - ${credentials.user.uid}>.`)

  const db = await cacheDatabase(firebase.database())
  db.cacheDate = new Date()

  // collect books covers to cache
  const cacheBooks = Object.values(db.books).map(book => {
    if (!book || !book.cover || !book.cover.url) return null
    return book
  }).filter(x => !!x)

  // create images directory if not exists
  if (!fs.existsSync('./public/img')) {
    fs.mkdirSync('./public/img')
  }

  // download cover images
  await Promise.all(cacheBooks.map(book => {
    // updating cached db cuz we need calculate later hash of file with cached urls
    const cacheUrl = `/img/${book.id}.png`
    const localPath = `./public/img/${book.id}.png`
    db.books[book.id].cover.cache = cacheUrl
    console.log(`downloading book cover <${book.title}> id: <${book.id}>`)
    return axios.get(book.cover.url, { responseType: 'arraybuffer' })
      .then(res => fs.writeFileSync(localPath, Buffer.from(res.data)))
  }))

  const dbCacheJs = `window.dbcache = ${JSON.stringify(db)}`
  fs.writeFileSync('./public/dbcache.js', dbCacheJs)
}

/** run main function */
go()
  .then(() => {
    console.log('done')
    process.exit(0)
  })
  .catch(err => {
    console.error('error happens on books creations', err)
    process.exit(1)
  })
