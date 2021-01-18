import _ from 'lodash'
import mergeOne from '@/util/mergeOne'
import collection from '@/store/collection/imaged'

const module = mergeOne(collection('people', 'cover'), {
  state: {
    peopleOrdered: [],
    filters: [],
  },
  mutations: {
    resetFilters(state) {
      state.filters = []
    },
    // override module set to randomize people
    set(state, data) {
      state.data = data
      state.peopleOrdered = _.shuffle(Object.values(data))
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
    },
    setFilters(state, filters) {
      state.filters = filters
    }
  },
  getters: {
    filtered: state => {
      if (!state.loaded) return []

      if (state.filters.length === 0) return state.peopleOrdered

      return state.peopleOrdered.filter(person =>
        state.filters.every(tag => {
          const list = Array.isArray(person.tags) ? person.tags :
            typeof person.tags === 'object' ? Object.keys(person.tags) :
            []
          return list.includes(tag)
        })
      )
    }
  }
})

export default module
