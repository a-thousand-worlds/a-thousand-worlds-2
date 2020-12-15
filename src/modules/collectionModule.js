import _ from 'lodash'
import firebase from '@/firebase'
import { firebaseGet } from '@/utils'

/** Wraps a Firebase collection in vuex module. */
const collectionModule = name => ({
  namespaced: true,
  state: () => ({
    data: {},
    loaded: false,
  }),
  mutations: {
    set(state, data) {
      state.data = data
      state.loaded = true
    },
  },
  getters: {
    /** Gets the value at the given key. */
    get: state => key => {
      return state.data[key]
    },
    /**
     * Find an entry in the collection by a given key.
     * @param key    The key to match. Supports _.get key expressions.
     * @param value  The value to match. Accepts a predicate that takes the deep value returned by the key expression.
     */
    findBy: state => (key, value) => {
      return Object.entries(state.data).find(
        ([entryKey, entryValue]) => {
          const deepValue = _.get(entryValue, key)
          return typeof value === 'function'
            ? value(deepValue)
            : deepValue === value
        }
      )
    },
  },
  actions: {
    /** Loads the collection from Firebase. */
    async load(state) {
      const value = await firebaseGet(name)
      const valueNotNull = value || {}
      state.commit('set', valueNotNull)
      return valueNotNull
    },
    /** Saves a record to the collection in Firebase. */
    async save(state, { key, value }) {
      if (!key) throw new Error('key required')
      if (value === undefined) throw new Error('value may not be undefined')
      const ref = firebase.database().ref(`${name}/${key}`)
      await ref.set(value)
    },
    /** Subscribes to the collection in Firebase, syncing with this.data */
    subscribe(state) {
      const ref = firebase.database().ref(name)
      ref.on('value', snap => {
        state.commit('set', snap.val() || {})
      })
    }
  },
})

export default collectionModule
