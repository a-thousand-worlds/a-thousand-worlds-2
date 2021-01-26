const admin = require('firebase-admin')
const express = require('express')
const uid = require('uuid/v4')
const serviceAccount = require('./serviceAccountKey.json')

/** Wraps a route handler in a try-catch statement that sends an error as a 500 response. */
const handleError = routeHandler => async (req, res) => {
  try {
    await routeHandler(req, res)
  }
  catch (err) {
    console.error(err)
    res.setHeader('content-type', 'text/plain')
    res.status(500)
    res.send(err.stack)
  }
}

module.exports = () => {

  const adminConfig = {
    ...JSON.parse(process.env.FIREBASE_CONFIG),
    credential: admin.credential.cert(serviceAccount),
  }
  admin.initializeApp(adminConfig)
  const db = admin.firestore()
  const app = express()

  // TODO: Secure this endpoint
  app.get('/', handleError(async (req, res) => {

    res.header('Access-Control-Allow-Origin', '*')

    const { to, html, subject } = req.query

    if (!to || !html || !subject) {
      res.status(500).send('Insufficient query parameters. to, subject, and html required.')
    }

    const id = uid()
    await db.collection('mail').add({
      to,
      message: {
        subject,
        html,
      }
    })

    console.log(`Email sent to ${to}: "${subject}"`)
    res.status(200).json({ id })

  }))

  return app
}
