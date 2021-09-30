import mergeOne from '@/util/mergeOne'
import collectionModule, { firebaseGet } from './modules/collection'
const firebaseImport = () => import(/* webpackChunkName: "firebase" */ '@/firebase')

// about 1e9
const START_CODE = 'atwxyz'
const MAX_COUNT = parseInt(START_CODE, 36)

/** Encode a count from base-10 to descending base-36. Subtract count from 1,000,000,000 to create keys in descending order. */
const encodeCount = count => (MAX_COUNT - (count || MAX_COUNT)).toString(36)

/** Decodes a count from descending base-36 into base-10. */
const decodeCount = code => MAX_COUNT - parseInt(code ?? START_CODE, 36)

/** Increment base-36 with 1e3 randomness to avoid collisions from simultaneous writes. */
const incrementCount = code => encodeCount(decodeCount(code) + Math.floor(Math.random() * 1e3))

const module = mergeOne(collectionModule('links'), {
  getters: {
    get: () => code => firebaseGet(`links/index/${code}`),
  },
  actions: {
    /** Creates and returns a new share code of the given type with the given data. */
    async create(ctx, { type, data }) {
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      const ref = firebase.database().ref('links/count')

      // transaction will automatically retry on failure
      const tx = await ref.transaction(incrementCount, (err, committed, snapshot) => {
        if (err) {
          throw new Error(err)
        } else if (!committed) {
          ctx.dispatch('ui/popup', 'Share count out of sync. Please try again.')
        }
        // if we successfully incremented the share code count, we can safely set the share code
        else {
          const code = snapshot?.toJSON()
          const indexRef = firebase.database().ref('links/index')
          indexRef.update({
            [code]: {
              createdAt: new Date().toISOString(),
              createdBy: ctx.rootState.user?.user?.uid || null,
              type,
              data,
            },
          })
        }
      })

      // get the share code from the transaction
      const code = tx.snapshot?.toJSON()
      return code
    },
  },
})

export default module
