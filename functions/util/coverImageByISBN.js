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
  // use sharp to convert webp to png (Jimp does not support webp)
  const sharpImage = await sharp(res.data).toFormat('png')
  const meta = await sharpImage.metadata()
  const buffer = await sharpImage.toBuffer()
  return {
    url,
    base64: 'data:image/png;base64,' + buffer.toString('base64'),
    width: meta.width,
    height: meta.height
  }
}

async function coverImageByISBN(isbn) {

  console.log('Searching covers')
  // only search Amazon, as Google and OpenLibrary images are too small
  const covers = await bookcovers.withIsbn(isbn, { type: 'amazon' })

  console.log('Retrieved covers', covers)
  let url = null
  if (covers.amazon && !covers.amazon.error) {
    const amazonSizes = Object.keys(covers.amazon)
    const largestAmazonCover = Math.max.apply(null, amazonSizes.map(s => parseFloat(s, 10)))
    url = covers.amazon[largestAmazonCover + 'x'] ||
      covers.amazon['3x'] ||
      covers.amazon['2x'] ||
      covers.amazon['1.5x'] ||
      covers.amazon['1x']
  }

  if (!url) {
    console.error('No cover')
    return null
  }

  console.log(`Fetching book cover: ${url}`)
  return loadImage(url)
}

module.exports = coverImageByISBN
