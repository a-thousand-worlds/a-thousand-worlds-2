const bookcovers = require('bookcovers')
const axios = require('axios').default
const sharp = require('sharp')

async function loadImage(url, scaleToMaxWidth = 0) {
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
  let sharpImage = await sharp(res.data).toFormat('png')
  let meta = await sharpImage.metadata()
  if (scaleToMaxWidth && meta.width > scaleToMaxWidth) {
    sharpImage = await sharpImage.resize(scaleToMaxWidth)
    meta = await sharpImage.metadata()
  }
  const buffer = await sharpImage.toBuffer()

  return {
    url,
    buffer,
    base64: 'data:image/png;base64,' + buffer.toString('base64'),
    width: meta.width,
    height: meta.height
  }
}

async function coverImageByISBN(isbn, scaleToMaxWidth = 0) {

  console.log('Searching covers')
  // only search Amazon, as Google and OpenLibrary images are too small
  // --no-sandbox argument is required as puppeteer is running as root on firebase function
  const covers = await bookcovers.withIsbn(isbn, { type: 'amazon', amazon: { args: ['--no-sandbox'] } })

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
  return loadImage(url, scaleToMaxWidth)
}

module.exports = coverImageByISBN
