const functions = require('firebase-functions')
const admin = require('firebase-admin')
const coverImageByISBN = require('./util/coverImageByISBN')
const UUID = require('uuid')

const getDownloadUrl = (fileName, bucketName, token) => `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`

const watchBooks = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB',
  })
  .database.ref('/books/{id}')
  .onCreate(async (snap, context) => {

    const book = snap.val()
    console.log(new Date(), 'Finding cover for book submission:', book.isbn)

    await snap.ref.child('findingCover').set(true)
    let img
    try {
      // scaling cover image for book for maximum width 400px
      img = await coverImageByISBN(book.isbn, 400)
    }
    finally {
      await snap.ref.child('findingCover').remove()
    }

    if (!img) {
      console.log('No cover:', book.isbn)
      return
    }

    console.log(new Date(), 'Saving cover to storage:', book.isbn)

    const bucket = admin.storage().bucket()
    const uuid = UUID.v4()
    const fname = `books/${context.params.id}`
    const file = await bucket.file(fname)
    await file
      .save(img.buffer, {
        metadata: {
          contentType: 'image/png',
          cacheControl: 'public,max-age=31536000',
          metadata: {
            firebaseStorageDownloadTokens: uuid
          }
        }
      })
    const url = getDownloadUrl(fname, bucket.name, uuid)

    await snap.ref.child('cover').set({
      url,
      width: img.width,
      height: img.height
    })
    console.log(new Date(), 'Cover saved:', book.isbn, url)

  })

module.exports = watchBooks
