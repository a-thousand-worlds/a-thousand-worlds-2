const express = require('express')
const puppeteer = require('puppeteer-extra')
const puppeteerStealth = require('puppeteer-extra-plugin-stealth')
puppeteer.use(puppeteerStealth())
const cheerio = require('cheerio')

// amazon uses '+' char to separate keywords in url, not %20 encoded 'space'
const amazonSearchUrl = keywords =>
  `https://www.amazon.com/s?k=${keywords.split(' ').map(el => encodeURIComponent(el)).join('+')}&i=stripbooks&s=relevanceexprank&unfiltered=1&ref=sr_adv_b`

// search book url if  puppeteer element contains it
const getBookUrl = async element => {
  const prop = await element.getProperty('innerHTML')
  const html = await prop.jsonValue()
  const $ = cheerio.load(html)
  const $span = $('span.rush-component')
  if (!$span) return null
  const $a = $('a.a-link-normal', $span)
  if (!$a) return null
  return $a.attr('href')
}

module.exports = () => {
  const app = express()

  app.get('/', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')

    if (!req.query || !req.query.keyword) {
      res.send(JSON.stringify(null))
      return
    }
    console.log(`searching book isbn for [${req.query.keyword}]`)
    const keywords = req.query.keyword

    const browser = await puppeteer.launch({
      defaultViewport: { width: 800, height: 600, deviceScaleFactor: 3 },
      args: ['--no-sandbox']
    })
    const page = await browser.newPage()
    let result = null
    try {
      await page.goto(amazonSearchUrl(keywords), {
        waitUntil: 'networkidle2'
      })
      const widgets = await page.$$('.celwidget')

      let bookUrl = null
      if (Array.isArray(widgets)) {
        const urls = await Promise.all(widgets.map(wgt => getBookUrl(wgt)))
        bookUrl = urls.filter(url => !!url)[0]
      }

      if (bookUrl) {
        console.log('checking book page', bookUrl)
        await page.goto(`https://amazon.com${bookUrl}`, {
          waitUntil: 'networkidle2'
        })

        const pageHtml = await page.content()
        const $book = cheerio.load(pageHtml)

        const $attributes = $book('#dp-container li.rpi-carousel-attribute-card')

        let isbn10 = null
        let isbn13 = null

        $attributes.each((i, $attribute) => {
          const $lbl = $book('.rpi-attribute-label', $attribute)
          const $val = $book('.rpi-attribute-value', $attribute)
          if ($lbl.text().trim() === 'ISBN-10') isbn10 = $val.text().trim()
          if ($lbl.text().trim() === 'ISBN-13') isbn13 = $val.text().trim()
        })

        if (isbn10 || isbn13) {
          result = {
            title: $book('#productTitle').text().trim(),
            url: `https://amazon.com${bookUrl.split('?')[0]}`,
            isbn: isbn10 || isbn13,
            isbn10: isbn10,
            isbn13: isbn13,
            thumbnail: $book('#img-canvas img').attr('src')
          }
        }
      }
    }
    catch (err) {
      console.error('error on amazon scraping', err)
      result = null
    }
    await browser.close()
    console.log('search result', result)
    res.json(result)
  })

  return app
}
