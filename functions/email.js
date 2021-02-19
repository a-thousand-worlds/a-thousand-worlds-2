const admin = require('firebase-admin')
const functions = require('firebase-functions')
const express = require('express')
// cors module automatically handles OPTIONS requests
const cors = require('cors')({ origin: true })
const mailgunjs = require('mailgun-js')
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
  const app = express()
  app.use(cors)

  app.get('/', handleError(async (req, res) => {

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      res.status(401).send('Not authorized.')
      return
    }

    const token = req.headers.authorization.split('Bearer ')[1]
    let user = null
    try {
      user = await admin.auth().verifyIdToken(token)
    }
    catch (err) {
      console.log('verifying token error', err)
      user = null
    }

    if (!user) {
      res.status(401).send('Not authorized.')
      return
    }

    admin.database().ref(`users/${user.uid}/roles`).once('value', rolesSnap => {
      const roles = rolesSnap.val()

      // here is a point we testing user permission to send emails
      if (!roles.owner && !roles.advizor && !roles.contributor && !roles.creator) {
        console.log('user attempt to send email without permission!', user)
        res.status(403).send('Not allowed.')
        return
      }

      const { to, html, subject } = req.query

      if (!to || !html || !subject) {
        res.status(500).send('Insufficient query parameters. to, subject, and html required.')
        return
      }

      const mgConfig = functions.config().mailgun

      const mailgun = mailgunjs({
        domain: mgConfig.domain,
        apiKey: mgConfig.apiKey
      })

      mailgun.messages().send({
        from: mgConfig.sender,
        to,
        subject,
        html: html
      }, (err, result) => {
        if (err) {
          console.log('Email sending error', err)
          res.status(501).json({ err })
          return
        }
        console.log(`Email sent to ${to}: "${subject}"`)
        res.status(200).json({ id: result.id })
      })

    })

  }))

  return app
}
