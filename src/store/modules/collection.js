// import firebase from '@/firebase'
import { get, set } from '@/util/get-set'
const firebaseImport = () => import(/* webpackChunkName: "firebase" */ '@/firebase')

/** Gets the value of a Firebase reference. */
export const firebaseGet = refString => new Promise((resolve, reject) => {
  firebaseImport().then(firebasem => {
    const firebase = firebasem.default
    const ref = firebase.database().ref(refString)
    ref.once('value', snap => {
      resolve(snap.val())
    })
  })
})

/** Wraps a Firebase collection in vuex module. */
const collectionModule = name => ({
  namespaced: true,
  state: {
    data: {},
    loaded: false,
  },
  mutations: {
    set(state, data) {
      state.data = data
      state.loaded = true
    },
    setOne(state, { path, value }) {
      set(state.data, path, value)
      // marking collection as loaded cuz we have at least one record
      state.loaded = true
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
     * @param path   The path to match. Supports "/" or "." delimited path expressions. (optional)
     * @param value  The value to match. Accepts a predicate that takes the deep value returned by the key expression.
     */
    findBy: state => (path, value) => {

      // optional initial argument
      if (value === undefined) {
        value = path
        path = ''
      }

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
    async load(context) {
      const value = await firebaseGet(name)
      const valueNotNull = value || {}
      context.commit('set', valueNotNull)
      return valueNotNull
    },
    /** Loads single element from Firebase */
    async loadOne(context, path) {
      const value = await firebaseGet(`${name}/${path}`)
      const valueNotNull = value || {}
      context.commit('setOne', { path, value: valueNotNull })
      return valueNotNull
    },
    /** Saves a record to the collection in Firebase. */
    async save(context, { path, value }) {
      if (!path) throw new Error('path required')
      if (value === undefined) throw new Error('value may not be undefined')
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      const ref = firebase.database().ref(`${name}/${path}`)
      await ref.set(value)
    },
    /**
     * Subscribes to the collection in Firebase, syncing with this.data
     *
     * @param onValue    Pass-through Firebase value event.
     * @param transform  Transform the value before it is saved to the state.
     */
    subscribe(context, { onValue, transform } = {}) {
      firebaseImport().then(firebasem => {
        const firebase = firebasem.default
        const ref = firebase.database().ref(name)
        ref.on('value', snap => {
          const value = snap.val()
          const valueTransformed = transform ? transform(value) : value
          context.commit('set', valueTransformed || {})

          // call onValue after updating state
          if (onValue) {
            onValue(value)
          }
        })
      })
    },
    /** Removes collection entry from Firebase */
    async remove(context, path) {
      if (!path) throw new Error('path required')
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      const ref = firebase.database().ref(`${name}/${path}`)
      await ref.remove()
    },
    /** Updates a record in the collection in Firebase. */
    async update(context, { path, value }) {
      if (!path) throw new Error('path required')
      if (value === undefined) throw new Error('value may not be undefined')
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      const ref = firebase.database().ref(`${name}/${path}`)
      await ref.update(value)
    },
  },
})

export default collectionModule
