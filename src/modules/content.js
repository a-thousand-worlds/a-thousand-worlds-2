import firebase from '@/firebase'
import { firebaseGet } from '@/utils'

const module = {
  namespaced: true,
  state: () => ({
    data: {},
    defaults: {},
    loaded: false,
  }),
  mutations: {
    set(state, data) {
      state.data = data
      state.loaded = true
    },
  },
  actions: {
    /** Loads the content collection from Firebase. */
    async load(state) {
      const value = await firebaseGet('content')
      const valueNotNull = value || {}
      state.commit('set', valueNotNull)
      return valueNotNull
    },
    /** Saves a record to the content collection in Firebase. */
    async save(state, { key, value }) {
      if (!key) throw new Error('key required')
      if (value === undefined) throw new Error('value may not be undefined')
      const ref = firebase.database().ref(`content/${key}`)
      await ref.set(value)
    },
  },
  getters: {
    /** Gets the content of the given key, or its default. */
    get: state => key => {
      return state.data[key] ?? state.defaults[key]
    },
  },
}

export default module
