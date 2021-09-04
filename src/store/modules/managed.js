/** A collection that overrides save to provide `createdAt`/`createdBy`, `updatedAt`/`updatedBy`, `reviewedAt`/`reviewedBy` fields. */
import collection from '@/store/modules/collection'
import mergeOne from '@/util/mergeOne'
import setCacheRequired from '@/util/setCacheRequired'
const firebaseImport = () => import(/* webpackChunkName: "firebase" */ '@/firebase')

const module = name => {
  const collectionModule = collection(name)
  const managedModule = {
    actions: {
      /** save method overrides parents collection/abstract::save */
      async save(ctx, { path, value, method }) {
        if (!path) throw new Error(`Managed collection "${name}": path required`)

        // only manage timestamps if saving a collection item
        // skip timestamp if path is '/' which may be used in multi-path updates
        // See: https://stackoverflow.com/a/33793367/480608
        const skipTimestamps = /.[/.]./g.test(path) || path === '/'
        if (skipTimestamps) {
          return collectionModule.actions[method || 'save'](ctx, { path, value })
        }

        // managed collection element should be object
        if (typeof value !== 'object')
          throw new Error(
            `Managed collection "${name}": value should be object, not ${typeof value}`,
          )

        const now = new Date().toISOString()
        const userId = ctx.rootState?.user?.user?.uid || null
        const valueNew = {
          ...value,
          updatedAt: now,
          updatedBy: userId,
          ...(method !== 'update' && !value.createdAt && { createdAt: now }),
          ...(method !== 'update' && !value.createdBy && { createdBy: userId }),
          ...(method !== 'update' &&
            value.reviewedBy &&
            !value.reviewedAt && { reviewedAt: userId }),
        }

        const firebasem = await firebaseImport()
        const firebase = firebasem.default
        await setCacheRequired()
        return firebase.database().ref(`${name}/${path}`)[method || 'set'](valueNew)
      },

      async update(ctx, { path, value }) {
        ctx.dispatch('save', { path, value, method: 'update' })
      },
    },
  }
  return mergeOne(collectionModule, managedModule)
}

export default module
