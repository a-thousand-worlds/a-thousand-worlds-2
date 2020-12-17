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
export async function coverImageByISBN(code) {
  const req = await axios.get(FETCH_COVER_IMAGE_URL + '?isbn=' + code)
  return req.data || null
}

// loads book metadata, excluting cover image
export async function metadataByISBN(code) {
  const req = await axios.get(FETCH_METADATA_URL + '?isbn=' + code)
  const data = req.data
  // it's so happens, that sometime google data is not accessible
  // from backend, so trying to reload it on frontend
  if (data && !data.google) {
    data.google = await _isbn(code, 'google')
  }
  const src = data.google || data.openlib || null
  // published date can be different. sometimes it's only 'YYYY',
  // sometimes 'YYYY-MM' sometimes other formats - dayjs manages this
  const d = dayjs(src.publishedDate)
  const ret = {
    isbn: data.isbn,
    title: src.title || '',
    description: src.description || '',
    authors: src.authors || [],
    illustrators: src.illustrators || [],
    year: d.isValid() ? d.year() : '',
    publisher: src.publisher || '',
    goodread: data.goodread || ''
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

export async function findBookByKeyword(keyword) {
  if (typeof keyword !== 'string' || !keyword.length) {
    return null
  }
  const url = SEARCH_ISBN_URL + '?keyword=' + encodeURIComponent(keyword)
  const ret = await axios.get(url)
  return ret.data
}
