// const _ = require('lodash')
const express = require('express')
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')

const amazonSearchUrl = keywords =>
  `https://www.amazon.com/s?k=${keywords.replace(/ /g, '+')}&i=stripbooks&s=relevanceexprank&unfiltered=1&ref=sr_adv_b`

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
      // const pageContent = await page.content()
      const widgets = await page.$$('.celwidget')

      const urls = []

      if (Array.isArray(widgets)) {
        // `for of` to use await
        for (const wgt of widgets) {
          const wgtp = await wgt.getProperty('innerHTML')
          const wgtv = await wgtp.jsonValue()
          const wgtHtml = wgtv.toLowerCase()
          const $ = cheerio.load(wgtv)
          const $span = $('span.rush-component')
          if ($span) {
            const $a = $('a.a-link-normal', $span)
            if ($a) {
              const aUrl = $a.attr('href')
              if (aUrl)
                urls.push(aUrl)
            }
          }
        }
      }

      if (urls.length) {
        // going to 1st books page
        console.log('checking book page', urls[0])
        await page.goto(`https://amazon.com${urls[0]}`, {
          waitUntil: 'networkidle2'
        })

        const pageHtml = await page.content()
        const $book = cheerio.load(pageHtml)

        const $attributes = $book('#dp-container li.rpi-carousel-attribute-card')

        let isbn10 = null
        let isbn13 = null
        let thumb = null
        // doing for loop, cuz $attributes is not a real array, but has similar way of iteration
        for (let i = 0; i< $attributes.length; i++) {
          let $at = $attributes[`${i}`]
          const $lbl = $book('.rpi-attribute-label',$at)
          const $val = $book('.rpi-attribute-value',$at)
          if ($lbl.text().trim() === 'ISBN-10')
            isbn10 = $val.text().trim()
          if ($lbl.text().trim() === 'ISBN-13')
            isbn13 = $val.text().trim()
        }

        if (isbn10 || isbn13) {
          const $img = $book('#img-canvas img')
          thumb = $img.attr('src')
          result = {
            isbn: isbn10 || isbn13,
            isbn10: isbn10,
            isbn13: isbn13,
            thumbnail: thumb
          }
        }
      }
    }
    catch (err) {
      console.log('error happens', err)
      result = null
    }
    await browser.close()
    console.log('search result', result)
    res.json(result)

  })

  return app

}
