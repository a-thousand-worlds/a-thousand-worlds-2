import * as deck from 'deck'
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
      Object.values(data).reduce((accum, person) => ({
        ...accum,
        [person.id]: Object.keys(person.identities || {})
      }))
      const weightedIds = {
        a: 10,
        b: 8,
        c: 2,
        d: 1,
        e: 1,
      }
      const shuffledIds = deck.shuffle(weightedIds)
      state.peopleOrdered = shuffledIds.map(id => data[id])
      state.loaded = true
    },
  },
  getters: {
    // override filterable getters.filtered to pass state.peopleOrdered as items
    filtered: (state, getters, rootState) => {
      const tags = rootState.tags.people.data
      console.log('tags', tags)
      return moduleFilterable.getters.filtered(state)(state.peopleOrdered, 'identities')
    }
  }
})

export default module
