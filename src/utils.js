import axios from 'axios'
import isbn from 'node-isbn'
import firebase from './firebase'

const FNURL = process.env.VUE_APP_SEARCH_SERVICE_URL

function _isbn(code, provider) {
  return new Promise((resolve, reject) => {
    isbn
      .provider([provider])
      .resolve(code, (err, book) => {
        if (book && !err) {
          resolve(book)
          return
        }
        resolve(null)
      })
  })
}

export async function isbnSearch(code) {
  const req = await axios.get(FNURL + '?isbn=' + code)
  const ret = req.data
  if (ret && !ret.google) {
    ret.google = await _isbn(code, 'google')
  }
  return ret
}

/** Gets the value of a Firebase reference. */
export const firebaseGet = refString => new Promise((resolve, reject) => {
  const ref = firebase.database().ref(refString)
  ref.once('value', snap => {
    resolve(snap.val())
  })
})
