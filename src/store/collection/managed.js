/** Managed collection elements use `createdAt`/`createdBy`, `updatedAt`/`updatedBy`, `approvedBy`/`approvedAt` fields for elements */
import collection from '@/store/collection/module'
import mergeOne from '@/util/mergeOne'
import firebase from '@/firebase'
import dayjs from 'dayjs'

const module = name => mergeOne(collection(name), {
  actions: {
    /** save method overrides parents collection/abstract::save */
    async save(state, { key, value }) {
      if (!key) throw new Error('key required')
      // managed collection element should be object
      if (typeof value !== 'object') throw new Error('value should be object')

      const now = dayjs()
      const user = state.rootState?.user?.user?.uid || null
      value.updatedAt = now.format()
      value.updatedBy = user
      if (!value.createdAt || !value.createdBy) {
        value.createdAt = now.format()
        value.createdBy = user
      }
      if (value.approvedBy && !value.approvedAt) {
        value.approvedAt = now.format()
      }
      const ref = firebase.database().ref(`${name}/${key}`)
      await ref.set(value)
    }
  }
})

export default module
