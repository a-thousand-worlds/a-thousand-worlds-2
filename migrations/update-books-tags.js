/**
  Updating books tags from list of tags name like ['tag1Name', 'tag2Name'] to object like { tag1Id: true, tag2Id: true }
*/
const fs = require('fs')

if (!fs.existsSync('/tmp/atw/books.json') || !fs.existsSync('/tmp/atw/books.tags.json')) {
  console.error('Missing data. Run "npm run update:books:tags" to get it from Firebase')
  process.exit(1)
}

let books = null
let tags = null

try {
  books = JSON.parse(fs.readFileSync('/tmp/atw/books.json'))
  tags = JSON.parse(fs.readFileSync('/tmp/atw/books.tags.json'))
} catch (e) {
  console.error('reading data files error. breaking', e)
  process.exit(1)
}

if (!books || !tags) {
  console.error('data is empty. breaking')
  process.exit(1)
}

const tagsList = Object.keys(tags).map(tagId => tags[tagId])

const booksIds = Object.keys(books)

const nextBooks = {}

booksIds.forEach(bookId => {
  const book = books[bookId]

  if (!Array.isArray(book.tags)) {
    nextBooks[bookId] = book
  } else {
    const nextTags = book.tags
      .map(tagName => tagsList.find(tag => tag.tag === tagName))
      .reduce((acc, tag) => {
        acc[tag.id] = true
        return acc
      }, {})
    book.tags = nextTags
    console.log('book updated', book.title)
    nextBooks[bookId] = book
  }
})

fs.writeFileSync('./books.rebuilded.json', JSON.stringify(nextBooks, null, 2))
console.log(
  'Old books version saved at /tmp/atw/books.json, and updated file saved to ./books.updated.json - you need manually import it to Firebase. There is no reason to track this file with git, it is saved here just to find it easy - remove it after import is complete',
)
