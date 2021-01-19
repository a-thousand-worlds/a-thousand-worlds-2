import _ from 'lodash'
import mergeOne from '@/util/mergeOne'
import collection from '@/store/collection/imaged'
import filterable from '@/store/collection/filterable'

const moduleFilterable = filterable()
const module = mergeOne(collection('people', 'cover'), moduleFilterable, {
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
