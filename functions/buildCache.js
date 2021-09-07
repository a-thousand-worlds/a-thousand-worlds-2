/** An HTTP server that provides a public endpoint for rebuilding dbcache.js. */

const express = require('express')
const rebuildCache = require('./util/rebuildCache')

module.exports = () => {
  const app = express()
  app.get('/', async (req, res) => {
    const host = req.query.host || 'all'
    res.header('Access-Control-Allow-Origin', '*')
    try {
      const ret = await rebuildCache(host)
      res.json({ ok: ret })
    } catch (err) {
      console.error('ERROR!', err)
      res.json({ err })
    }
  })
  return app
}
