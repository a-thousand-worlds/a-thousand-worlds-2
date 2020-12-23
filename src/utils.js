import axios from 'axios'
import isbn from 'node-isbn'
import dayjs from 'dayjs'
import firebase from './firebase'

const FETCH_METADATA_URL = process.env.VUE_APP_METADATA_SERVICE_URL
const FETCH_COVER_IMAGE_URL = process.env.VUE_APP_COVER_IMAGE_SERVICE_URL
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

// loads only book cover
export async function coverImageByISBN(isbn) {
  const req = await axios.get(FETCH_COVER_IMAGE_URL + '?isbn=' + isbn)
  return req.data || null
}

// loads book metadata, excluting cover image
export async function metadataByISBN(isbn) {
  const req = await axios.get(FETCH_METADATA_URL + '?isbn=' + isbn)
  const data = req.data || {}
  // it's so happens, that sometime google data is not accessible
  // from backend, so trying to reload it on frontend
  if (data && !data.google) {
    data.google = await _isbn(isbn, 'google')
  }
  const src = data.google || data.openlib || {}
  // published date can be different. sometimes it's only 'YYYY',
  // sometimes 'YYYY-MM' sometimes other formats - dayjs manages this
  const d = dayjs(src.publishedDate)
  const ret = {
    authors: src.authors || [],
    goodread: data.goodread || '',
    illustrators: src.illustrators || [],
    isbn: data.isbn,
    publisher: src.publisher || '',
    summary: src.description || '',
    title: src.title || '',
    year: d.isValid() ? d.year() : '',
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

/** Sets the value to a Firebase reference. */
export const firebaseSet = async (path, value) => {
  const ref = await firebase.database().ref(path)
  await ref.set(value)
}

export async function findBookByKeyword(keyword) {
  if (typeof keyword !== 'string' || !keyword.length) {
    return null
  }
  const url = SEARCH_ISBN_URL + '?keyword=' + encodeURIComponent(keyword)
  const ret = await axios.get(url)
  return ret.data
}
