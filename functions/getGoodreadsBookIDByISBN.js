const assert = require('assert')
const functions = require('firebase-functions')
const axios = require('axios').default
const express = require('express')

async function getGoodreadsBookIDByISBN(isbn) {

  console.log(`Searching ID for "${isbn}"`)

  const key = functions.config().goodreads.api_key

  try {
    const { data: id } = await axios({
      url: `https://www.goodreads.com/book/isbn_to_id/`,
      method: 'get',
      params: { key, isbn },
      responseType: 'text',
    })
    console.log(`  ID: ${id}`)
    return id
  }
  catch (err) {
    console.log(`Unable to find ID for ${isbn}.`, err.message)
    return null
  }
}

module.exports = () => {

  const app = express()

  assert(functions.config().goodreads.api_key)

  app.get('/', async (req, res) => {

    // headers
    res.header('Access-Control-Allow-Origin', '*')

    // input validation
    if (!req.query || !req.query.isbn) {
      res.status(422).send('ISBN required')
      return
    }

    // search for id on Goodreads
    const id = await getGoodreadsBookIDByISBN(req.query.isbn)
    res.json(id)

  })

  return app
}
