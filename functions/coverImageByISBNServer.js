const express = require('express')
const coverImageByISBN = require('./util/coverImageByISBN')

module.exports = () => {

  const app = express()

  app.get('/', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')

    if (!req.query || !req.query.isbn) {
      res.send(JSON.stringify(null))
      return
    }
    console.log(`searching cover for [${req.query.isbn}]`)
    const img = await coverImageByISBN(req.query.isbn)
    if (img) {
      console.log(`[${req.query.isbn}] cover found`)
    }
    else {
      console.log(`[${req.query.isbn}] cover not found`)
    }
    res.json({
      url: img.url,
      base64: 'data:image/png;base64,' + img.buffer.toString('base64'),
      width: img.width,
      height: img.height,
    })
  })

  return app
}
