const firebaseImport = () => import(/* webpackChunkName: "firebase" */ '@/firebase')

/** Marks cache flag */
const setCacheRequired = async () => {
  const firebasem = await firebaseImport()
  const firebase = firebasem.default
  const ref = firebase.database().ref('cache/clean')
  await ref.set(false)
}

export default setCacheRequired
