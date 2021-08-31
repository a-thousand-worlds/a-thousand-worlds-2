import { dateComparator } from '@/util/dateComparator'
import collectionModule from './modules/collection'
const firebaseImport = () => import(/* webpackChunkName: "firebase" */ '@/firebase')

const module = mergeOne(collectionModule('log'), {
  getters: {
    listSorted: (state, getters) => () =>
      state.loaded
        ? // eslint-disable-next-line fp/no-mutating-methods
          getters.list().sort(dateComparator('createdAt'))
        : null,
  },
})

export default module
