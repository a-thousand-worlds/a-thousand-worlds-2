const express = require('express')
const bookcovers = require('bookcovers')
const axios = require('axios').default
const sharp = require('sharp')

async function loadImage2Base64(url) {
  let res = null
  try {
    res = await axios.get(url, {
      responseType: 'arraybuffer'
    })
  }
  catch (e) {
    console.error(e, 'loadImage2Base64 error')
    res = null
  }
  if (!res || !res.data) {
    return null
  }
  const img = await sharp(res.data).toFormat('png')
  const meta = await img.metadata()
  const buff = await img.toBuffer()
  return {
    url: url,
    base64: 'data:image/png;base64,' + buff.toString('base64'),
    width: meta.width,
    height: meta.height
  }
}

async function isbnSearch(code) {
  const covers = await bookcovers.withIsbn(code)
  // console.log('covers', covers)
  let url = null
  if (covers.amazon) {
    const amazonSizes = Object.keys(covers.amazon)
    const largestAmazonCover = Math.max.apply(null, amazonSizes.map(s => parseFloat(s, 10)))
    url = covers.amazon[largestAmazonCover + 'x'] ||
      covers.amazon['2x'] ||
      covers.amazon['1.5x'] ||
      covers.openLibrary.medium ||
      covers.amazon['1x']
  }
  else if (covers.openLibrary) {
    url = covers.openLibrary.large ||
      covers.openLibrary.small
  }
  else if (covers.google) {
    url = covers.google.thumbnail ||
      covers.google.smallThumbnail
  }
  console.log(`Fetching book cover: ${url}`)
  const img = await loadImage2Base64(url)
  return img
}

module.exports = () => {

  const app = express()

  app.get('/', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    if (!req.query || !req.query.isbn) {
      res.send(JSON.stringify(null))
      return
    }
    console.log(`searching cover for [${req.query.isbn}]`)
    const img = await isbnSearch(req.query.isbn)
    if (img) {
      console.log(`[${req.query.isbn}] cover found`)
    }
    else {
      console.log(`[${req.query.isbn}] cover not found`)
    }
    res.json(img)
  })

  return app
}
