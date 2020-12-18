const functions = require('firebase-functions')
const admin = require('firebase-admin')
const coverImageByISBN = require('./util/coverImageByISBN')

/** Retries a function a given number of times. */
const retry = async (f, n) => {
  // eslint-disable-next-line fp/no-loops
  for (let i = 0; i < n; i++) {
    try {
      const output = await f()
      return output
    }
    catch (e) {
      if (i === n - 1) {
        throw e
      }
    }
  }
}

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
      img = await retry(() => {
        const img = coverImageByISBN(book.isbn)
        if (!img) throw new Error('No cover; retry')
        return img
      }, 3)
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
      .bucket('gs://' + process.env.FIREBASE_CONFIG.storageBucket)
      .file(`books/${context.params.id}`)
      .save(img.buffer, {
        contentType: 'image/png',
        cacheControl: 'public,max-age=31536000'
      })

    console.log(new Date(), 'Cover saved:', book.isbn)

  })

module.exports = watchBookSubmissions
