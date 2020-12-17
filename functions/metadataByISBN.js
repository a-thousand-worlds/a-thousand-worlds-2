const functions = require('firebase-functions')
const axios = require('axios').default
const express = require('express')
const isbn = require('node-isbn')

async function getGoodReadsBookIDByISBN(isbn) {
  let res = null
  try {
    res = await axios({
      url: `https://www.goodreads.com/book/isbn_to_id/`,
      method: 'get',
      params: {
        key: functions.config().goodreads.api_key,
        isbn: isbn
      },
      responseType: 'text',
    })
  }
  catch (e) {
    console.error('axios error', e)
    res = ''
  }
  if (!res || !res.data) {
    return ''
  }
  return res.data || ''
}

function _isbn(code, provider) {
  return isbn
    .provider([provider])
    .resolve(code)
    // eslint-disable-next-line node/handle-callback-err
    .catch(err => null)
}

async function isbnSearch(code) {
  const gBook = await _isbn(code, 'google')
  const oBook = await _isbn(code, 'openlibrary')
  if (!gBook && !oBook) {
    return null
  }
  const book = {
    isbn: code,
    google: gBook,
    openlib: oBook,
  }
  return book
}

module.exports = () => {

  const app = express()

  app.get('/', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    if (!req.query || !req.query.isbn) {
      res.send(JSON.stringify(null))
      return
    }
    console.log(`searching [${req.query.isbn}]`)
    const book = await isbnSearch(req.query.isbn)
    if (!book) {
      console.log(`[${req.query.isbn}] not found`)
      res.json(null)
      return
    }
    book.goodread = await getGoodReadsBookIDByISBN(req.query.isbn)
    const ttl = book.google ? book.google.title : book.openlib.title
    console.log(`[${req.query.isbn}] found - ${ttl}`)
    console.log(book)
    res.json(book)
  })

  return app
}
