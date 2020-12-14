import axios from 'axios'
import isbn from 'node-isbn'
import firebase from './firebase'

const FETCH_METADATA_URL = process.env.VUE_APP_SEARCH_SERVICE_URL
const SEARCH_ISBN_URL = process.env.VUE_APP_FIND_ISBN_URL

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
  const req = await axios.get(FETCH_METADATA_URL + '?isbn=' + code)
  const ret = req.data
  // it's so happens, that sometime google data is not accessible
  // from backend, so trying to reload it on frontend
  console.log(ret)
  if (ret && !ret.google) {
    ret.google = await _isbn(code, 'google')
  }
  const src = ret.google || ret.openlib || null
  ret.title = ''
  ret.description = ''
  ret.authors = ''
  ret.illustrators = ''
  ret.year = ''
  ret.publisher = ''
  if (!src) {
    return ret
  }
  ret.title = src.title || ''
  ret.description = src.description || ''
  ret.authors = src.authors || []
  ret.illustrators = src.illustrators || []
  ret.year = src.year || ''
  ret.publisher = src.publisher || ''
  return ret
}

/** Gets the value of a Firebase reference. */
export const firebaseGet = refString => new Promise((resolve, reject) => {
  const ref = firebase.database().ref(refString)
  ref.once('value', snap => {
    resolve(snap.val())
  })
})

export async function findBookByTitle(keyword) {
  if (typeof keyword !== 'string' || !keyword.length) {
    return null
  }
  const url = SEARCH_ISBN_URL + '?keyword=' + encodeURIComponent(keyword)
  // console.log('search url', url)
  const ret = await axios.get(url)
  // console.log('search res', ret)
  return ret.data
}
