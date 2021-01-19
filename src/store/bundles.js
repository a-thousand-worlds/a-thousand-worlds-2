import _ from 'lodash'
import mergeOne from '@/util/mergeOne'
import imaged from '@/store/modules/imaged'
import filterable from '@/store/modules/filterable'

const moduleFilterable = filterable()
const module = mergeOne(imaged('bundles', 'cover'), moduleFilterable, {
  state: {
    bundlesOrdered: [],
  },
  mutations: {
    // override module set to randomize bundles
    set(state, data) {
      state.data = data
      state.bundlesOrdered = _.shuffle(Object.values(data))
      state.loaded = true
    },
  },
  getters: {
    // override filterable getters.filtered to pass state.bundlesOrdered as items
    filtered: state => moduleFilterable.getters.filtered(state)(state.bundlesOrdered)
  }
})

export default module
