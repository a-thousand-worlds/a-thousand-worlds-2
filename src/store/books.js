import _ from 'lodash'
import mergeOne from '@/util/mergeOne'
import collection from '@/store/collection/imaged'

const module = mergeOne(collection('books', 'cover'), {
  state: {
    booksOrdered: [],
    filters: [],
  },
  mutations: {
    resetFilters(state) {
      state.filters = []
    },
    // override module set to randomize books
    set(state, data) {
      state.data = data
      state.booksOrdered = _.shuffle(Object.values(data))
      state.loaded = true
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
    filtered: state => {
      if (!state.loaded) return []

      if (state.filters.length === 0) return state.booksOrdered

      return state.booksOrdered.filter(book =>
        state.filters.every(tag => {
          const list = Array.isArray(book.tags) ? book.tags :
            typeof book.tags === 'object' ? Object.keys(book.tags) :
            []
          return list.includes(tag)
        })
      )
    }
  }
})

export default module
