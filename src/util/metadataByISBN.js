import axios from 'axios'
import isbn from 'node-isbn'
import dayjs from 'dayjs'

function _isbn(code, provider) {
  return new Promise((resolve, reject) => {
    isbn.provider([provider]).resolve(code, (err, book) => {
      if (book && !err) {
        resolve(book)
        return
      }
      resolve(null)
    })
  })
}

/** Loads book metadata, excluding cover image. */
const metadataByISBN = async isbn => {
  // sometimes data is not accessible
  // from backend, so trying to reload it on frontend
  const req = await axios.get(process.env.VUE_APP_METADATA_BY_ISBN_URL + '?isbn=' + isbn)
  const book = req.data || (await _isbn(isbn, 'google'))

  // published date can be different. sometimes it's only 'YYYY',
  // sometimes 'YYYY-MM' sometimes other formats - dayjs manages this
  const d = dayjs(book.publishedDate)

  return {
    authors: book.authors || [],
    goodreads: book.goodreads || '',
    illustrators: book.illustrators || [],
    isbn: book.isbn,
    publisher: book.publisher || '',
    summary: book.description || '',
    title: book.title || '',
    year: d.isValid() ? d.year() : '',
  }
}

export default metadataByISBN
