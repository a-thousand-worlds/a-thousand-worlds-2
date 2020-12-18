import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'

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

// Vue will not load DATABASE_EMULATOR which is automatically set by "firebase emulators:start" since it does not start with VUE_APP
// https://cli.vuejs.org/guide/mode-and-env.html#environment-variables
// https://stackoverflow.com/a/63127747/480608
if (process.env.VUE_APP_DATABASE_EMULATOR) {
  const db = firebase.database()
  db.useEmulator('localhost', 5002)
}

export default firebase
