const bookcovers = require('bookcovers')
const axios = require('axios').default
const sharp = require('sharp')

async function loadImage(url) {
  let res = null
  try {
    res = await axios.get(url, {
      responseType: 'arraybuffer'
    })
  }
  catch (e) {
    console.error(e, 'loadImage error')
    res = null
  }
  if (!res || !res.data) {
    return null
  }
  const img = await sharp(res.data).toFormat('png')
  const meta = await img.metadata()
  const buffer = await img.toBuffer()
  return {
    url,
    buffer,
    width: meta.width,
    height: meta.height
  }
}

async function coverImageByISBN(isbn) {

  console.log('Searching covers')
  const covers = await bookcovers.withIsbn(isbn)

  console.log('Retrieved covers', covers)
  let url = null
  if (covers.amazon && !covers.amazon.error) {
    const amazonSizes = Object.keys(covers.amazon)
    const largestAmazonCover = Math.max.apply(null, amazonSizes.map(s => parseFloat(s, 10)))
    url = covers.amazon[largestAmazonCover + 'x'] ||
      covers.amazon['2x'] ||
      covers.amazon['1.5x'] ||
      (covers.openLibrary && covers.openLibrary.medium) ||
      covers.amazon['1x']
  }
  else if (covers.openLibrary && !covers.openLibrary.error) {
    url = covers.openLibrary.large ||
      covers.openLibrary.small
  }
  else if (covers.google && !covers.google.error) {
    url = covers.google.thumbnail ||
      covers.google.smallThumbnail
  }

  if (!url) {
    console.error('No cover')
    return null
  }

  console.log(`Fetching book cover: ${url}`)
  return loadImage(url)
}

module.exports = coverImageByISBN
