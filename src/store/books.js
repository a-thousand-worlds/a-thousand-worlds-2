import _ from 'lodash'
import mergeOne from '@/util/mergeOne'
import managed from '@/store/modules/managed'
import filterable from '@/store/modules/filterable'

const moduleFilterable = filterable()
const module = mergeOne(managed('books'), moduleFilterable, {
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
