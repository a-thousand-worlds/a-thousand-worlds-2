const functions = require('firebase-functions')
const searchISBN = require('./searchISBN')
const findISBN = require('./findISBN')

// increase function memory since we are doing image processing
// https://firebase.google.com/docs/functions/manage-functions#set_timeout_and_memory_allocation

exports.searchISBN = functions
  .runWith({ memory: '1GB' })
  .https.onRequest(searchISBN())

exports.findISBN = functions
  .runWith({ memory: '1GB' })
  .https.onRequest(findISBN())
