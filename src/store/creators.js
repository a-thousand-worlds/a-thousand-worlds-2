import * as deck from 'deck'
import mergeOne from '@/util/mergeOne'
import imaged from '@/store/modules/imaged'
import filterable from '@/store/modules/filterable'

/** Gets the weight of the person's identities. */
const getPersonShuffleWeight = (person, tags) => {

  if (!person.identities || person.identities.length === 0) return 1

  // get the weight of each of the person's identities
  // console.log('person', person)
  const weights = Object.keys(person.identities || {})
    .map(id => {
      if (!(id in tags)) {
        console.warn(`Invalid tag: ${id}`)
      }
      return tags[id]?.weight || 0
    })

  return weights.reduce((accum, x) => accum + x)

}

const moduleFilterable = filterable()
const module = mergeOne(imaged('people', 'cover'), moduleFilterable, {
  state: {
    shuffled: [],
  },
  mutations: {
    shuffle(state, tags) {

      if (!state.loaded) return

      const weightedIds = Object.values(state.data).reduce((accum, person) => ({
        ...accum,
        [person.id]: getPersonShuffleWeight(person, tags)
      }), {})

      const shuffledIds = deck.shuffle(weightedIds)
      state.shuffled = shuffledIds.map(id => state.data[id])
    }
  },
  getters: {
    // override filterable getters.filtered to pass state.peopleOrdered as items
    filtered: (state, getters, rootState) =>
      moduleFilterable.getters.filtered(state)(state.shuffled, 'identities')
  }
})

export default module
