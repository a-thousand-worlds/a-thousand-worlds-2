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
      save(ctx, { path, value, method }) {
        if (!path) throw new Error('path required')

        // only manage timestamps if saving a collection item
        const isSubpath = /.[/.]./g.test(path)
        if (isSubpath) {
          return collectionModule.actions[method || 'save'](ctx, { path, value })
        }

        // managed collection element should be object
        if (typeof value !== 'object') throw new Error('value should be object')

        const now = dayjs().format()
        const userId = ctx.rootState?.user?.user?.uid || null
        const valueNew = {
          ...value,
          updatedAt: now,
          updatedBy: userId,
          ...method !== 'update' && !value.createdAt && { createdAt: now },
          ...method !== 'update' && !value.createdBy && { createdBy: userId },
          ...method !== 'update' && value.reviewedBy && !value.reviewedAt && { reviewedAt: userId },
        }

        return firebase.database().ref(`${name}/${path}`)[method || 'set'](valueNew)
      },

      async update(ctx, { path, value }) {
        ctx.dispatch('save', { path, value, method: 'update' })
      }

    }
  }
  return mergeOne(collectionModule, managedModule)
}

export default module
