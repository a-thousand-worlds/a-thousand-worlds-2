/** A collection that overrides save to provide `createdAt`/`createdBy`, `updatedAt`/`updatedBy`, `reviewedAt`/`reviewedBy` fields. */
import collection from '@/store/modules/collection'
import mergeOne from '@/util/mergeOne'
import firebase from '@/firebase'
import dayjs from 'dayjs'

const module = name => {
  const collectionModule = collection(name)
  const managedModule = {
    actions: {
      /** save method overrides parents collection/abstract::save */
      save(state, { path, value }) {
        if (!path) throw new Error('path required')

        // only manage timestamps if saving a collection item
        const isSubpath = /.[/.]./g.test(path)
        if (isSubpath) {
          return collectionModule.actions.save(state, { path, value })
        }

        // managed collection element should be object
        if (typeof value !== 'object') throw new Error('value should be object')

        const now = dayjs().format()
        const userId = state.rootState?.user?.user?.uid || null

        return firebase.database().ref(`${name}/${path}`)
          .set({
            ...value,
            updatedAt: now,
            updatedBy: userId,
            ...!value.createdAt && { createdAt: now },
            ...!value.createdBy && { createdBy: userId },
            ...value.reviewedBy && !value.reviewedAt && { reviewedAt: userId },
          })
      }
    }
  }
  return mergeOne(collectionModule, managedModule)
}

export default module
