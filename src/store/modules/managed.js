/** Managed collection elements use `createdAt`/`createdBy`, `updatedAt`/`updatedBy`, `reviewedBy`/`reviewedAt` fields for elements */
import collection from '@/store/modules/collection'
import mergeOne from '@/util/mergeOne'
import firebase from '@/firebase'
import dayjs from 'dayjs'

const module = name => mergeOne(collection(name), {
  actions: {
    /** save method overrides parents collection/abstract::save */
    async save(state, { path, value }) {
      if (!path) throw new Error('path required')
      // managed collection element should be object
      if (typeof value !== 'object') throw new Error('value should be object')

      const now = dayjs()
      const user = state.rootState?.user?.user?.uid || null
      value.updatedAt = now.format()
      value.updatedBy = user
      if (!value.createdAt) {
        value.createdAt = now.format()
      }
      if (!value.createdBy) {
        value.createdBy = user
      }
      if (value.reviewedBy && !value.reviewedAt) {
        value.reviewedAt = now.format()
      }
      const ref = firebase.database().ref(`${name}/${path}`)
      await ref.set(value)
    }
  }
})

export default module
