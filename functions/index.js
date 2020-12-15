const functions = require('firebase-functions')
const metadataByISBN = require('./metadataByISBN')
const coverImageByISBN = require('./coverImageByISBN')
const searchISBN = require('./searchISBN')
const findISBN = require('./findISBN')
const email = require('./email')

// increase function memory since we are doing image processing
// https://firebase.google.com/docs/functions/manage-functions#set_timeout_and_memory_allocation

exports.searchISBN = functions
  .runWith({ memory: '1GB' })
  .https.onRequest(searchISBN())

exports.findISBN = functions
  .runWith({ memory: '1GB' })
  .https.onRequest(findISBN())

exports.email = functions
  .https.onRequest(email())

exports.metadataByISBN = functions
  .https.onRequest(metadataByISBN())

exports.coverImageByISBN = functions
  .https.onRequest(coverImageByISBN())
