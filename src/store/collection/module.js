import firebase from '@/firebase'
import { firebaseGet } from '@/utils'
import { get, set } from '@/util/get-set'

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
    setOne(state, { path, data }) {
      set(state.data, path, data)
    }
  },
  getters: {
    /** Gets the value at the given path. */
    get: state => path => {
      return get(state.data, path)
    },
    /** Gets the entire collection */
    getAll: state => () => {
      return state.data
    },
    /**
     * Find a value in the collection by a given key.
     *
     * @param path   The path to match. Supports "/" or "." delimited path expressions.
     * @param value  The value to match. Accepts a predicate that takes the deep value returned by the key expression.
     */
    findBy: state => (path, value) => {
      const entry = Object.entries(state.data).find(
        ([entryKey, entryValue]) => {
          const deepValue = get(entryValue, path)
          return typeof value === 'function'
            ? value(deepValue)
            : deepValue === value
        }
      )
      return entry ? entry[1] : null
    },
    list: state => () => state.loaded
      ? Object.values(state.data)
      : [],
  },
  actions: {
    /** Loads the collection from Firebase. */
    async load(state) {
      const value = await firebaseGet(name)
      const valueNotNull = value || {}
      state.commit('set', valueNotNull)
      return valueNotNull
    },
    /** Loads single element from Firebase */
    async loadOne(state, path) {
      const value = await firebaseGet(`${name}/${path}`)
      const valueNotNull = value || {}
      state.commit('setOne', { path, data: valueNotNull })
      return valueNotNull
    },
    /** Saves a record to the collection in Firebase. */
    async save(state, { path, value }) {
      if (!path) throw new Error('path required')
      if (value === undefined) throw new Error('value may not be undefined')
      const ref = firebase.database().ref(`${name}/${path}`)
      await ref.set(value)
    },
    /** Subscribes to the collection in Firebase, syncing with this.data */
    subscribe(state) {
      const ref = firebase.database().ref(name)
      ref.on('value', snap => {
        state.commit('set', snap.val() || {})
      })
    },
    /** Removes collection entry from Firebase */
    async remove(state, path) {
      if (!path) throw new Error('path required')
      const ref = firebase.database().ref(`${name}/${path}`)
      await ref.remove()
    },
    /** Updates a record in the collection in Firebase. */
    async update(state, { path, values }) {
      if (!path) throw new Error('path required')
      if (values === undefined) throw new Error('values may not be undefined')
      const ref = firebase.database().ref(`${name}/${path}`)
      await ref.update(values)
    },
  },
})

export default collectionModule
