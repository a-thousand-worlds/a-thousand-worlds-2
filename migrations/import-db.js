/** Converts books from A Thousands Worlds V1 */
const fs = require('fs')
const promptly = require('promptly')

const envFile = process.argv[process.argv.length - 1]

if (envFile.endsWith('import-books.js')) {
  console.log('Ussage: npm run import:books PATH_TO_ENV_FILE')
  process.exit(0)
}

require('dotenv').config({ path: envFile })

console.log(`using firebase config from <${envFile}>`)

/** loading firebase website "collection" and mapping to array */
const loadCollection = (f, path) => {
  return new Promise((resolve, reject) => {
    const db = f.database()
    const ref = db.ref(path)
    ref.once('value', snap => {
      const collection = snap.val()
      resolve(collection)
      /*
      resolve(Object.keys(collection).map(id => {
        const record = collection[id]
        if (!record.id) record.id = id
        return record
      }))
      */
    })
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
  console.log(`Authorized as ${credentials.user.displayName} - ${credentials.user.uid}>.`)

  console.log(`Loading existing data.`)

  const books = await loadCollection(firebase, 'books')
  const tagsBooks = await loadCollection(firebase, 'tags/books')
  const tagsPeople = await loadCollection(firebase, 'tags/people')
  const tagsBundles = await loadCollection(firebase, 'tags/bundles')
  const people = await loadCollection(firebase, 'people')
  const users = await loadCollection(firebase, 'users')
  const contributors = Object.values(users).filter(user => user.roles && (user.roles.contributor || user.roles.owner))
  const content = await loadCollection(firebase, 'content')

  const db = JSON.stringify({
    books,
    people,
    tags: {
      books: tagsBooks,
      people: tagsPeople,
      bundles: tagsBundles
    },
    contributors,
    content
  }, null, 2)

  fs.writeFileSync('./public/dbcache.js', `window.dbcache = ${db}`)

  console.log('saved')
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
