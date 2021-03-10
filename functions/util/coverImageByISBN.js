const loadImage = require('./loadImage')
// const bookcovers = require('bookcovers')

// comment if bookcovers module used
/**/
const puppeteer = require('puppeteer-extra')
const puppeteerStealth = require('puppeteer-extra-plugin-stealth')
puppeteer.use(puppeteerStealth())
const amazonIsbnSearchUrl = isbn =>
  `https://www.amazon.com/gp/search/ref=sr_adv_b/?search-alias=stripbooks&unfiltered=1&field-isbn=${isbn}&sort=relevanceexprank`

function parseSrcset(srcset) {
  if (!srcset) return null
  return srcset
    .split(', ')
    .map(d => d.split(' '))
    .reduce((p, c) => {
      if (c.length !== 2) {
        // throw new Error("Error parsing srcset.");
        return p
      }
      p[c[1]] = c[0]
      return p
    }, {})
}

const getBookSrcset = async image => {
  const element = await image.asElement()
  const propertyHandle = await element.getProperty('srcset')
  const propertyValue = await propertyHandle.jsonValue()
  return propertyValue
}

async function scrape(isbn) {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 800, height: 600, deviceScaleFactor: 3 },
    args: ['--no-sandbox']
  })
  const page = await browser.newPage()
  await page.goto(amazonIsbnSearchUrl(isbn), {
    waitUntil: 'networkidle2'
  })
  const images = await page.$$('.s-image')
  const srcsets = await Promise.all(images.map(image => getBookSrcset(image)))
  await browser.close()
  const thumbs = srcsets.map(parseSrcset).filter(a => !!a)
  return thumbs.length > 0 ? thumbs[0] : null
}
/**/

async function coverImageByISBN(isbn, scaleToMaxWidth = 0) {

  console.log('Searching covers')

  const covers = { amazon: {} }
  covers.amazon = await scrape(isbn)
  // to use with bookcovers module if required
  // const covers = await bookcovers.withIsbn(isbn, { type: 'amazon', amazon: { args: ['--no-sandbox'] } })

  console.log('Retrieved covers', JSON.stringify(covers))
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
