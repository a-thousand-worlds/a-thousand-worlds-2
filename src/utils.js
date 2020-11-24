import axios from 'axios'

const FNURL = 'http://localhost:5001/firebase-test-294020/us-central1/searchISBN'

export async function isbnSearch(code) {
  const req = await axios.get(FNURL + '?isbn=' + code)
  return req.data
}
// import isbn from 'node-isbn'

// import Jimp from 'jimp/es'
// const sharp = require('sharp')

/*
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

async function _grabImage(url) {
  let res = null
  try {
    res = await Jimp.read({
      url: url
    })
  }
  catch (e) {
    res = null
  }
  if (!res) {
    return null
  }
  const img = await res.getBase64Async(Jimp.MIME_PNG)
  return img
}

export async function isbnSearch(code) {
  const gBook = await _isbn(code, 'google')
  if (!gBook) {
    return null
  }
  const oBook = await _isbn(code, 'openlibrary')
  const book = {
    google: gBook,
    openlib: oBook,
    covers: [],
    cover: null
  }
  if (gBook.imageLinks && gBook.imageLinks.thumbnail) {
    const gCover = await _grabImage(gBook.imageLinks.thumbnail)
    if (gCover) {
      // eslint-disable-next-line  fp/no-mutating-methods
      book.covers.push(gCover)
    }
  }
  if (oBook && oBook.imageLinks && oBook.imageLinks.thumbnail) {
    let oUrl = oBook.imageLinks.thumbnail
    if (oUrl.includes('-S.')) {
      oUrl = oUrl.split('-S.').join('.')
    }
    const oCover = await _grabImage(oUrl)
    if (oCover) {
      // eslint-disable-next-line  fp/no-mutating-methods
      book.covers.push(oCover)
    }
  }
  if (book.covers.length) {
    book.cover = book.covers.reduce((acc, b) => acc.length > b.length ? acc : b, '')
  }
  return book
}
*/
