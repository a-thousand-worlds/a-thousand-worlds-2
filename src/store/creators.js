import _ from 'lodash'
import mergeOne from '@/util/mergeOne'
import imaged from '@/store/modules/imaged'
import filterable from '@/store/modules/filterable'

const moduleFilterable = filterable()
const module = mergeOne(imaged('people', 'cover'), moduleFilterable, {
  state: {
    peopleOrdered: [],
  },
  mutations: {
    // override module set to randomize people
    set(state, data) {
      state.data = data
      state.peopleOrdered = _.shuffle(Object.values(data))
      state.loaded = true
    },
  },
  getters: {
    // override filterable getters.filtered to pass state.peopleOrdered as items
    filtered: state => moduleFilterable.getters.filtered(state)(state.peopleOrdered)
  }
})

export default module
