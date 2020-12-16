import mergeOne from '@/util/mergeOne'
import collection from '@/modules/collection/managed'

const module = mergeOne(collection('people'), {
  getters: {
    list: state => state.loaded
      // eslint-disable-next-line fp/no-mutating-methods
      ? Object.keys(state.data)
        .map(id => state.data[id])
      : []
  }
})

export default module
