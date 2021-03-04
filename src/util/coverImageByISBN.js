import axios from 'axios'

/** Loads only book cover. */
const coverImageByISBN = async isbn => {
  const req = await axios.get(`${process.env.VUE_APP_COVER_IMAGE_BY_ISBN_URL}?isbn=${isbn}`)
  return req.data || null
}

export default coverImageByISBN
