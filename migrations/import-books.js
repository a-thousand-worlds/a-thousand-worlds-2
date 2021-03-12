const fs = require('fs')
const promptly = require('promptly')
const uuid = require('uuid').v4
const dayjs = require('dayjs')
// used to search publisher metadata (not presented at source data)
const isbn = require('node-isbn')

const importFile = process.argv[process.argv.length - 2]
const importDetailsFile = process.argv[process.argv.length - 1]
const envFile = process.argv[process.argv.length - 3]

require('dotenv').config({ path: envFile })

console.log(`import with files: books <${importFile}>, details <${importDetailsFile}>`)

/** loading json data and mapping to array */
const loadJson = path => {
  if (!fs.existsSync(path) || !path.endsWith('.json')) {
    console.error(`File ${path} not exists or not a json file`)
    return null
  }
  let data = null
  try {
    data = JSON.parse(fs.readFileSync(path))
  }
  catch (e) {
    console.error(`Parsing ${path} error`, e)
    return null
  }
  if (!data) {
    console.error(`File ${path} is empty!`)
    return null
  }
  if (Array.isArray(data)) return data
  return Object.keys(data).map(id => {
    const obj = data[id]
    if (obj.id) return obj
    // users not contains ids, but we need them
    obj.id = id
    return obj
  })
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

/** Metadata by isbn functions */
const _isbn = (code, provider) => {
  return isbn
    .provider([provider])
    .resolve(code)
    .catch(err => {
      console.error(`metadata searching at <${provider}> error!`, err)
      return null
    })
}

const isbnSearch = async code => {
  const gBook = await _isbn(code, 'google')
  const oBook = await _isbn(code, 'openlibrary')
  if (!gBook && !oBook) {
    return null
  }
  const info = {
    publisher: gBook && gBook.publisher ? gBook.publisher : oBook && oBook.publisher ? oBook.publisher : ''
  }
  return info
}

/** Source data */
const books = loadJson('/tmp/atw/books.json')
const tags = loadJson('/tmp/atw/books.tags.json')
// creators can be updated if new created
let creators = loadJson('/tmp/atw/people.json')
const users = loadJson('/tmp/atw/users.json')
const importBooks = loadJson(importFile)
const importDetails = loadJson(importDetailsFile)

if (!books || !tags || !creators || !users || !importBooks || !importDetails) {
  console.error('Data missing! Ussage: "npm export:books PATH_TO_EXPORT_JSON_FILE"')
  process.exit(1)
}

/** Converting tags */
const convertTags = list => {
  return list.map(tagName => {
    const tag = tags.find(tg => tg.tag.toLowerCase() === tagName.toLowerCase())
    if (!tag) console.error(`Converting tag ${tagName} failed. Tag not found`)
    return tag
  })
    .filter(x => !!x)
    .reduce((accum, tag) => {
      accum[tag.id] = true
      return accum
    }, {})
}

/** Converting creators. */
const convertCreator = (name, creatorUser) => {
  let person = creators.find(p => p.name.toLowerCase() === name.toLowerCase())
  if (person) {
    return {
      creator: person,
      new: []
    }
  }
  console.log(`Creator <${name}> not found in database. Preparing new`)
  const id = uuid()
  person = {
    id: id,
    createdAt: dayjs().format(),
    createdBy: creatorUser.id,
    approvedAt: dayjs().format(),
    approvedBy: creatorUser.id,
    updatedAt: dayjs().format(),
    updatedBy: creatorUser.id,
    name: name,
    bio: '',
  }
  return {
    creator: person,
    new: [person]
  }
}

/** Converting book from source data to new structure */
const convertBook = async (info, creator) => {
  const id = uuid()
  const bookCreators = {}
  let newCreators = []
  const authors = info.author.split(',').map(author => {
    const converted = convertCreator(author, creator)
    newCreators = [...newCreators, ...converted.new]
    creators = [...creators, ...converted.new]
    return converted.creator
  })
  let illustratorIsSame = false
  const illustrators = info.illustrator.split(',').map(illustrator => {
    if (illustrator.toLowerCase() === 'same') {
      illustratorIsSame = true
      return null
    }
    const converted = convertCreator(illustrator, creator)
    newCreators = [...newCreators, ...converted.new]
    creators = [...creators, ...converted.new]
    return converted.creator
  }).filter(x => !!x)
  authors.forEach(a => {
    bookCreators[a.id] = 'author'
    if (illustratorIsSame) {
      bookCreators[a.id] = 'both'
    }
  })
  illustrators.forEach(a => {
    bookCreators[a.id] = 'illustrator'
  })
  const tags = convertTags(info.tags)
  const cover = {
    downloadUrl: `http://athousandworlds.org/assets/covers/${info.isbn}.jpg`
  }
  const meta = await isbnSearch(info.isbn)

  const book = {
    id: id,
    createdBy: creator.id,
    createdAt: dayjs().format(),
    creators: bookCreators,
    goodreads: info.details.goodreads || '',
    isbn: info.isbn,
    cover: cover,
    publisher: meta.publisher,
    reviewedAt: dayjs().format(),
    reviewedBy: creator.id,
    status: 'approved',
    submissionId: null,
    summary: info.details.text,
    tags: tags,
    title: info.title,
    year: info.details.year,
  }

  return { book, newCreators }
}

/** Main function */
const go = async () => {
  console.log(`Exporting books from ${importFile}`)
  console.log('existing books', books.length)
  console.log('importing books', importBooks.length)

  // let's get owners
  const owners = users.filter(user => user.roles && user.roles.owner)

  if (!owners.length) {
    console.error('Can\'t find owner user. Break.')
    process.exit(1)
  }
  let owner = owners[0]
  if (owners.length > 1) {
    const emails = owners.map(ow => ow.profile.email)
    const ownerEmail = await promptly.choose(`Select user as books creator [${emails.join('/')}]`, emails)
    owner = owners.find(ow => ow.profile.email === ownerEmail)
  }

  console.log(`User <${owner.profile.email}> will be used as books creator`)

  const newBooks = importBooks.map((eb, i) => {
    const details = importDetails[i]
    const exByName = books.find(book => eb.title.toLowerCase() === book.title.toLowerCase())
    const exByIsbn = books.find(book => details.isbn === book.isbn)
    const exByIsbn13 = books.find(book => details.isbn13 === book.isbn)

    if (!exByName && !exByIsbn && !exByIsbn13) {
      eb.details = details
      return eb
    }
    return null
  }).filter(x => !!x)

  console.log(`\nFound <${newBooks.length}> new books\n`)

  let books2create = []
  let creators2create = []
  let yesAll = false
  // eslint-disable-next-line fp/no-loops
  for (const info of newBooks) {
    console.log('\n')
    // console.log('Createnew book', book)
    const { book, newCreators } = await convertBook(info, owner)
    // console.log('CreateBook?', book)
    let ok = 'yes'
    if (!yesAll) {
      ok = await promptly.choose(`Create new book <${book.title}>? [Yes/no/abort/all]`, ['yes', 'no', 'abort', 'all'], { default: 'yes' })
    }
    if (ok === 'abort') {
      console.log('aborting')
      process.exit(0)
    }
    if (ok === 'no') {
      console.log('skipping')
      continue
    }
    if (ok === 'all') {
      yesAll = true
    }
    console.log(`Preparing book <${book.title}>`)
    books2create = [...books2create, book]
    creators2create = [...creators2create, ...newCreators]
  }

  console.log(`\nBooks to create: ${books2create.length}\nCreators to create: ${creators2create.length}\n`)

  const saveOrUpload = await promptly.choose('Upload to firebase or save to files? [Upload/save]', ['upload', 'save'], { default: 'upload' })
  if (saveOrUpload === 'save') {
    let savePath = await promptly.prompt('Path to save new json data? [./]', { default: './' })
    if (!savePath.endsWith('/')) savePath += '/'
    fs.writeFileSync(`${savePath}books2create.json`, JSON.stringify(books2create, null, 2))
    fs.writeFileSync(`${savePath}creators2create.json`, JSON.stringify(creators2create, null, 2))
    console.log(`Files <${savePath}books2create.json> and <${savePath}creators2create.json> saved.`)
    return
  }

  const usr = await promptly.prompt(`Website authentication email`)
  const pwd = await promptly.password(`Website authentication password for <${usr}>`)
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
    console.log('Firebase authentication error. No changes made. Aborting')
    return
  }

  // creating users
  // eslint-disable-next-line fp/no-loops
  for (const creator of creators2create) {
    const ref = firebase.database().ref(`people/${creator.id}`)
    await ref.set(creator)
    console.log(`Creator <${creator.name}> saved [${creator.id}]`)
  }

  // creating books
  // eslint-disable-next-line fp/no-loops
  for (const book of books2create) {
    const ref = firebase.database().ref(`books/${book.id}`)
    await ref.set(book)
    console.log(`Book <${book.title}> saved [${book.id}]`)
  }

}

go()
  .then(() => {
    console.log('done')
    process.exit(0)
  })
  .catch(err => {
    console.error('error happens on books creations', err)
    process.exit(1)
  })
