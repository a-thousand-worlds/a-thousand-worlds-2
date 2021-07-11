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

/** Loads book metadata, excluting cover image. */
const metadataByISBN = async isbn => {
  const req = await axios.get(process.env.VUE_APP_METADATA_BY_ISBN_URL + '?isbn=' + isbn)
  const data = req.data || {}
  // it's so happens, that sometime google data is not accessible
  // from backend, so trying to reload it on frontend
  if (data && !data.google) {
    data.google = await _isbn(isbn, 'google')
  }
  const src = data.google || data.openlib || {}
  // published date can be different. sometimes it's only 'YYYY',
  // sometimes 'YYYY-MM' sometimes other formats - dayjs manages this
  const d = dayjs(src.publishedDate)
  const ret = {
    authors: src.authors || [],
    goodreads: data.goodreads || '',
    illustrators: src.illustrators || [],
    isbn: data.isbn,
    publisher: src.publisher || '',
    summary: src.description || '',
    title: src.title || '',
    year: d.isValid() ? d.year() : '',
  }
  return ret
}

export default metadataByISBN
