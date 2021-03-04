import axios from 'axios'

const findBookByKeyword = async keyword => {
  if (typeof keyword !== 'string' || !keyword.length) {
    return null
  }
  const url = `${process.env.VUE_APP_AMAZON_SEARCH_BOOK_URL}?keyword=${encodeURIComponent(keyword)}`
  const ret = await axios.get(url)
  return ret.data
}

export default findBookByKeyword
