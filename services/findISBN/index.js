const _ = require('lodash')
const express = require('express')
const amazon = require('amazon-buddy')
const { validate } = require('is-isbn')

const isbnFromUrl = url => url.slice(url.lastIndexOf('/') + 1)
const isSponsored = product => product.title.startsWith('Sponsored Ad')

/** Wraps a route handler in a try-catch statement that sends an error as a 500 response. */
const handleError = routeHandler => async (req, res) => {
  try {
    await routeHandler(req, res)
  }
  catch (err) {
    res.setHeader('content-type', 'text/plain')
    res.status(500)
    res.send(err.stack)
  }
}

const app = express()

app.get('/', handleError(async (req, res) => {

  res.header('Access-Control-Allow-Origin', '*')

  const { keyword, number } = req.query

  if (!keyword) {
    res.status(500).send('"keyword" query parameter required')
    return
  }

  // fetch products using amazon-buddy API
  const products = await amazon.products({
    keyword,
    number: number || 1,
    category: 'stripbooks',
  })

  // find the first non-sponsored product with a valid ISBN extracted from its url
  const product = products.result
    .find(product => {
      if (isSponsored(product)) return false
      const isbn = isbnFromUrl(product.url)
      return validate(isbn)
    })

  if (!product) {
    res.json(null)
    console.log(new Date(), `Query: "${req.query.keyword}" (${products.result.length === 0 ? 'no results' : products.result.length} results)${ products.result.length > 0 ? ': No products with valid ISBN' : ''}`)
    return
  }

  const isbn = isbnFromUrl(product.url)

  console.log(new Date(), `Query: "${req.query.keyword}" (${products.result.length} results)`)
  console.log({ isbn, ...product })

  res.json({ isbn, ..._.pick(product, ['isbn', 'thumbnail', 'title', 'url']) })

}))

app.listen(3001, () => {
  console.log(`findISBN started on port ${3001}`)
})
