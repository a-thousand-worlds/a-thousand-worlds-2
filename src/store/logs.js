import { dateComparator } from '@/util/dateComparator'
import mergeOne from '@/util/mergeOne'
import collectionModule from './modules/collection'

const module = mergeOne(collectionModule('logs'), {
  getters: {
    listSorted: (state, getters) => () =>
      state.loaded
        ? // eslint-disable-next-line fp/no-mutating-methods
          getters.list().sort(dateComparator('createdAt'))
        : null,
  },
})

export default module
