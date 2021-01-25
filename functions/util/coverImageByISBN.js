const bookcovers = require('bookcovers')
const loadImage = require('./loadImage')

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
