import mergeOne from '@/util/mergeOne'
import collection from '@/store/collection/imaged'

const module = mergeOne(collection('books', 'cover'), {
  state: {
    filters: [],
  },
  mutations: {
    resetFilters(state) {
      state.filters = []
      state.booksFiltered = state.booksList
    },
    toggleFilter(state, filter) {
      if (!state.filters.includes(filter)) {
        // eslint-disable-next-line fp/no-mutating-methods
        state.filters.push(filter)
      }
      else {
        state.filters = state.filters.filter(x => x !== filter)
      }
    }
  },
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
          return state.filters.every(tag => {
            let list = []
            if (Array.isArray(book.tags)) list = book.tags
            else if (typeof book.tags === 'object') list = Object.keys(book.tags)
            return list.includes(tag)
          })
        })
      : []
  }
})

export default module
