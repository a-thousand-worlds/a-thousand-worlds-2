const admin = require('firebase-admin')
const express = require('express')
// cors module automatically handles OPTIONS requests
const cors = require('cors')({ origin: true })
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
  // generates error 9 FAILED_PRECONDITION: The Cloud Firestore API is not available for Datastore Mode projects
  // const db = admin.firestore()
  const app = express()
  app.use(cors)

  // TODO: Secure this endpoint
  app.get('/', handleError(async (req, res) => {

    console.log('GET header authorization: ', req.headers.authorization)
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

      const id = uid()
      // generates error 9 FAILED_PRECONDITION: The Cloud Firestore API is not available for Datastore Mode projects
      /*
      await db.collection('mail').add({
        to,
        message: {
          subject,
          html,
        }
      })
      */

      console.log(`Email sent to ${to}: "${subject}"`)
      res.status(200).json({ id })
    })

  }))

  return app
}
