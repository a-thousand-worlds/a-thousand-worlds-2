const express = require('express')
const rebuildCache = require('./util/rebuildCache')

module.exports = () => {
  const app = express()
  app.get('/', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    try {
      const ret = await rebuildCache()
      res.json({ ok: ret })
    }
    catch (err) {
      console.error('ERROR!', err)
      res.json({ err })
    }
  })
  return app
}
