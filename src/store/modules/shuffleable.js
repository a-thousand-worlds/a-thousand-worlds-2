/** A module that adds weighted shuffling via state.shuffled and a shuffle mutation. */

import * as deck from 'deck'

/** Gets the weight of the item's tags. */
const getShuffleWeight = (item, tagProp, weightSpec) => {

  const ids = item[tagProp]
  if (!ids || ids.length === 0) return 1

  // get the weight of each of the item's identities
  const weights = Object.keys(ids || {})
    .map(id => {
      if (!(id in weightSpec)) {
        console.warn(`Invalid tag: ${id}`, item)
      }
      return weightSpec[id]?.weight || 1
    })

  return weights.reduce((accum, x) => accum + x)

}

const module = () => ({
  state: {
    isShuffled: false,
    shuffled: [],
  },
  mutations: {
    shuffle(state, { idProp, weights }) {

      // if (!state.loaded) return

      if (!state.isShuffled) {
        const weightedIds = Object.values(state.data).reduce((accum, item) => ({
          ...accum,
          [item.id]: getShuffleWeight(item, idProp, weights)
        }), {})

        const shuffledIds = deck.shuffle(weightedIds)
        state.shuffled = shuffledIds.map(id => state.data[id])
        state.isShuffled = true
      }
      // if already shuffled, perform a merge that preserves order
      else {
        // delete items that no longer exist
        state.shuffled = state.shuffled.filter(itemOld => itemOld.id in state.data)

        // add new items to the beginning of shuffled
        const itemsNew = Object.values(state.data).filter(
          item => !state.shuffled.some(itemOld => itemOld.id === item.id)
        )
        state.shuffled = [...itemsNew, ...state.shuffled]

        // overwrite conflicting items
        state.shuffled = state.shuffled.map(itemOld => state.data[itemOld.id] || itemOld)
      }
    }
  },
})

export default module
