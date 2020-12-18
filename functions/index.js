const functions = require('firebase-functions')
const coverImageByISBN = require('./coverImageByISBNServer')
const email = require('./email')
const metadataByISBN = require('./metadataByISBN')
const searchISBN = require('./searchISBN')
const watchBookSubmissions = require('./watchBookSubmissions')

// increase function memory since we are doing image processing
// https://firebase.google.com/docs/functions/manage-functions#set_timeout_and_memory_allocation

exports.searchISBN = functions
  .runWith({ memory: '1GB' })
  .https.onRequest(searchISBN())

exports.email = functions
  .https.onRequest(email())

exports.metadataByISBN = functions
  .https.onRequest(metadataByISBN())

exports.coverImageByISBN = functions
  .https.onRequest(coverImageByISBN())

exports.watchBookSubmissions = watchBookSubmissions
