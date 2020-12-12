import firebase from '../firebase'

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
    load(state) {
      return new Promise((resolve, reject) => {
        const ref = firebase.database().ref('content')
        ref.once('value', snap => {
          const value = snap.val() || {}
          state.commit('set', value)
          resolve(value)
        })
      })
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
