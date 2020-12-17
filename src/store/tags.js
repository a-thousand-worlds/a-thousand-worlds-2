import mergeOne from '@/util/mergeOne'
import collection from '@/store/collection/managed'

const module = mergeOne(collection('tags'), {
  getters: {
    list: state => state.loaded
      // eslint-disable-next-line fp/no-mutating-methods
      ? Object.keys(state.data)
        .map(id => state.data[id])
        .sort((a, b) => parseInt(a.sortOrder) === parseInt(b.sortOrder) ? 0 : parseInt(a.sortOrder) > parseInt(b.sortOrder) ? 1 : -1)
      : []
  }
})

export default module
