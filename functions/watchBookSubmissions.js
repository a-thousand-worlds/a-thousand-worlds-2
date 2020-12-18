const functions = require('firebase-functions')
const admin = require('firebase-admin')
const coverImageByISBN = require('./util/coverImageByISBN')

const watchBookSubmissions = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB',
  })
  .database.ref('/submits/books/{id}')
  .onCreate(async (snap, context) => {

    const book = snap.val()
    console.log(new Date(), 'Finding cover for book submission:', book.isbn)

    await snap.ref.child('findingCover').set(true)
    let img
    try {
      img = await coverImageByISBN(book.isbn)
    }
    finally {
      await snap.ref.child('findingCover').remove()
    }

    if (!img) {
      console.log('No cover:', book.isbn)
      return
    }

    console.log(new Date(), 'Saving cover to storage:', book.isbn)
    await admin.storage()
      .bucket('gs://' + JSON.parse(process.env.FIREBASE_CONFIG).storageBucket)
      .file(`books/${context.params.id}`)
      .save(img.base64, {
        contentType: 'image/png',
        cacheControl: 'public,max-age=31536000',
        resumable: false,
      })

    console.log(new Date(), 'Cover saved:', book.isbn)

  })

module.exports = watchBookSubmissions
