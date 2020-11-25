import axios from 'axios'

// const FNURL = 'http://localhost:5001/firebase-test-294020/us-central1/searchISBN'
const FNURL = 'http://localhost:5001/'

export async function isbnSearch(code) {
  const req = await axios.get(FNURL + '?isbn=' + code)
  return req.data
}
