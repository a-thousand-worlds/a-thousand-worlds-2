import mergeOne from '@/util/mergeOne'
import collection from '@/modules/collection/imaged'

const module = mergeOne(collection('submits/books', 'cover'), {
  getters: {
    list: state => state.loaded
      ? Object.keys(state.data)
        .map(id => state.data[id])
      : [],
    filtered: state => state.loaded
      ? Object.keys(state.data)
        .map(id => state.data[id])
        .filter(book => {
          if (!state.filters.length) return true
          return state.filters.every(tag => (book.tags || []).includes(tag))
        })
      : []
  }
})

export default module
