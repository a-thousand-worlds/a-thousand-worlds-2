const _ = require('lodash')
const express = require('express')
const amazon = require('amazon-buddy')

// TODO: Replace with proper ISBN validation
const isValidIsbn = s => s && (s.length === 10 || s.length === 14)

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

module.exports = () => {

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

    console.log(req.query.keyword, `${products.result.length} results`)

    // find the first product with a valid ISBN extracted from its url
    const match = products.result
      .map(product => ({
        ...product,
        isbn: product.url.slice(product.url.lastIndexOf('/') + 1)
      }))
      .find(product => isValidIsbn(product.isbn))

    if (!match) {
      res.json(null)
      return
    }

    res.header('Access-Control-Allow-Origin', '*')
    res.json(_.pick(match, ['isbn', 'thumbnail', 'title', 'url']))
  }))

  return app
}
