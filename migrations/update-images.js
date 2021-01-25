/**
  Updating images for books and people to same structure everywhere
  imageField: {
    url: String,          // image url from firebase storage
    downloadUrl: String,  // image url to download and store at firebase
    base64: String,       // image at base64 format to store at firebase
    width: Number,        // image width
    height: Number        // image height
  }

  at normal situation only url, width and height exists
  otherwise downloadUrl or base64 fields are required
  images manipulations is going on backend with firebase functions
*/
const fs = require('fs')

if (!fs.existsSync('/tmp/atw/books.json')) {
  console.error('Missing data. Run "npm run update:images" to get it from Firebase')
  process.exit(1)
}

let books = null

try {
  books = JSON.parse(fs.readFileSync('/tmp/atw/books.json'))
}
catch (e) {
  console.error('reading data files error. breaking', e)
  process.exit(1)
}

if (!books) {
  console.error('data is empty. breaking')
  process.exit(1)
}

const booksIds = Object.keys(books)

const nextBooks = {}

booksIds.forEach(bookId => {
  const book = books[bookId]

  if (!book.cover) {
    console.log('book without cover?', book)
  }
  else {
    if (typeof book.cover === 'string') {
      book.cover = {
        url: book.cover,
        width: book.coverWidth,
        height: book.coverHeight
      }
      delete book.coverWidth
      delete book.coverHeight
      console.log('book completely updated', book.title)
    }
    else {
      // console.log(['book cover base64', book.cover.base64, typeof book.cover.base64 !== 'undefined'])
      if (typeof book.cover.base64 !== 'undefined') {
        delete book.cover.base64
        console.log('book updated - base64 removed', book.title)
      }
      else {
        console.log('book is ok', book.title, book.cover)
      }
    }
  }

  nextBooks[bookId] = book
})

fs.writeFileSync('./books.rebuilded.json', JSON.stringify(nextBooks, null, 2))
console.log('Old books version saved at /tmp/atw/books.json, and updated file saved to ./books.updated.json - you need manually import it to Firebase. There is no reason to track this file with git, it is saved here just to find it easy - remove it after import is complete')
