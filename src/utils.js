import axios from 'axios'

const FNURL = process.env.VUE_APP_SEARCH_SERVICE_URL

export async function isbnSearch(code) {
  const req = await axios.get(FNURL + '?isbn=' + code)
  return req.data
}
