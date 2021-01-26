/** A module that adds weighted shuffling via state.shuffled and a shuffle mutation. */

import * as deck from 'deck'

/** Gets the weight of the object's tags. */
const getShuffleWeight = (person, tagProp, weightSpec) => {

  const ids = person[tagProp]
  if (!ids || ids.length === 0) return 1

  // get the weight of each of the person's identities
  const weights = Object.keys(ids || {})
    .map(id => {
      if (!(id in weightSpec)) {
        console.warn(`Invalid tag: ${id}`, person)
      }
      return weightSpec[id]?.weight || 1
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
        [person.id]: getShuffleWeight(person, idProp, weights)
      }), {})

      const shuffledIds = deck.shuffle(weightedIds)
      state.shuffled = shuffledIds.map(id => state.data[id])
    }
  },
})

export default module
