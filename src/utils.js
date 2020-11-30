import axios from 'axios'
import isbn from 'node-isbn'

const FNURL = process.env.VUE_APP_SEARCH_SERVICE_URL

function _isbn(code, provider) {
  return new Promise((resolve, reject) => {
    isbn
      .provider([provider])
      .resolve(code, (err, book) => {
        if (book && !err) {
          resolve(book)
          return
        }
        resolve(null)
      })
  })
}

export async function isbnSearch(code) {
  const req = await axios.get(FNURL + '?isbn=' + code)
  const ret = req.data
  if (!ret.google) {
    ret.google = await _isbn(code, 'google')
  }
  return ret
}
