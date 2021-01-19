import _ from 'lodash'
import mergeOne from '@/util/mergeOne'
import collection from '@/store/collection/imaged'
import filterable from '@/store/collection/filterable'

const moduleFilterable = filterable()
const module = mergeOne(collection('books', 'cover'), moduleFilterable, {
  state: {
    booksOrdered: [],
  },
  mutations: {
    // override module set to randomize books
    set(state, data) {
      state.data = data
      state.booksOrdered = _.shuffle(Object.values(data))
      state.loaded = true
    },
  },
  getters: {
    // override filterable getters.filtered to pass state.booksOrdered as items
    filtered: state => moduleFilterable.getters.filtered(state)(state.booksOrdered)
  }
})

export default module
