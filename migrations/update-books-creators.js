/**
  Updating books creators from list of authors name like ['author1', 'author2'] to object like { author1Id: $role, author2Id: $role }
*/
const fs = require('fs')

if (!fs.existsSync('/tmp/atw/books.json') || !fs.existsSync('/tmp/atw/creators.json')) {
  console.error('Missing data. Run "npm run update:books:tags" to get it from Firebase')
  process.exit(1)
}

let books = null
let creators = null

try {
  books = JSON.parse(fs.readFileSync('/tmp/atw/books.json'))
  creators = JSON.parse(fs.readFileSync('/tmp/atw/creators.json'))
}
catch (e) {
  console.error('reading data files error. breaking', e)
  process.exit(1)
}

if (!books || !creators) {
  console.error('data is empty. breaking')
  process.exit(1)
}

const creatorsList = Object.keys(creators).map(creatorId => creators[creatorId])

const booksIds = Object.keys(books)

const nextBooks = {}

booksIds.forEach(bookId => {
  const book = books[bookId]

  if (!Array.isArray(book.authors)) {
    nextBooks[bookId] = book
  }
  else {
    const nextCreators = {}
    book.authors.forEach(author => {
      const person = creatorsList.find(person => person.name.toLowerCase() === author.toLowerCase())
      if (!person) {
        console.log(`author <${author}> person not found for book <${book.title}>`)
        return
      }
      nextCreators[person.id] = person.role || 'author'
    })
    if (Array.isArray(book.illustrators)) {
      book.illustrators.forEach(illustrator => {
        const person = creatorsList.find(person => person.name.toLowerCase() === illustrator.toLowerCase())
        if (!person) {
          console.log(`illustrator <${illustrator}> person not found for book <${book.title}>`)
          return
        }
        nextCreators[person.id] = nextCreators[person.id] ? 'both' : person.role || 'illustrator'
      })
    }
    book.creators = nextCreators
    delete book.authors
    delete book.illustrators
    console.log('book updated', book.title)
    nextBooks[bookId] = book
  }
})

fs.writeFileSync('./books.rebuilded.json', JSON.stringify(nextBooks, null, 2))
console.log('Old books version saved at /tmp/atw/books.json, and updated file saved to ./books.updated.json - you need manually import it to Firebase. There is no reason to track this file with git, it is saved here just to find it easy - remove it after import is complete')
