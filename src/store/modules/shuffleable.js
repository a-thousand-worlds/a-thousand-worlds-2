/** A module that adds weighted shuffling via state.shuffled and a shuffle mutation. */

import * as deck from 'deck'

/** Gets the weight of the person's identities. */
const getPersonShuffleWeight = (ids, weightSpec) => {

  if (!ids || ids.length === 0) return 1

  // get the weight of each of the person's identities
  const weights = Object.keys(ids || {})
    .map(id => {
      if (!(id in weightSpec)) {
        console.warn(`Invalid tag: ${id}`)
      }
      return weightSpec[id]?.weight || 0
    })

  return weights.reduce((accum, x) => accum + x)

}

const module = () => ({
  state: {
    shuffled: [],
  },
  mutations: {
    shuffle(state, { idProp, weights }) {

      if (!state.loaded) return

      const weightedIds = Object.values(state.data).reduce((accum, person) => ({
        ...accum,
        [person.id]: getPersonShuffleWeight(person[idProp], weights)
      }), {})

      const shuffledIds = deck.shuffle(weightedIds)
      state.shuffled = shuffledIds.map(id => state.data[id])
    }
  },
})

export default module
