import mergeOne from '@/util/mergeOne'
import collection from '@/store/collection/managed'

const module = mergeOne(collection('tags/bundles'), {
  getters: {
    listSorted: (state, getters) => () => state.loaded
      // eslint-disable-next-line fp/no-mutating-methods
      ? getters.list()
        .sort((a, b) => parseInt(a.sortOrder) === parseInt(b.sortOrder) ? 0 : parseInt(a.sortOrder) > parseInt(b.sortOrder) ? 1 : -1)
      : []
  }
})

export default module
