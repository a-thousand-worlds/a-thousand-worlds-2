import mergeOne from '@/util/mergeOne'
import collection from '@/modules/collection/imaged'

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
          return state.filters.every(tag => (book.tags || []).includes(tag))
        })
      : []
  }
})

export default module
