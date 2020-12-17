const module = {
  state: () => ({
    text: null,
    type: null,
    timeout: 0,
  }),
  mutations: {

    clearTimer(state) {
      clearTimeout(state.timeout)
      state.timeout = 0
    },

    set(state, value) {

      if (!value) {
        state.text = null
        state.type = null
      }
      else {
        const { text, type } = typeof value === 'string'
          ? { text: value }
          : value
        state.text = text
        state.type = type
      }

    },
  },
  actions: {

    alert(state, value) {

      state.commit('clearTimer')
      state.commit('set', value)

      if (value) {
        setTimeout(() => {
          state.commit('clearTimer')
          state.commit('set', { text: null, type: null })
        }, value.timer || 3000)
      }
    },

  },
}

export default module
