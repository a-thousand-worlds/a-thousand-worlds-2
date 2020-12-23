const module = {
  namespaced: true,
  state: () => ({
    busy: false,
    bookmarksOpen: false,
    viewMode: 'covers',
    dlgConfirm: null,
    popups: []
  }),
  mutations: {
    setBusy: (state, next) => {
      state.busy = next
    },
    setBookmarksOpen: (state, next) => {
      state.bookmarksOpen = next
    },
    setViewMode: (state, next) => {
      state.viewMode = next
    },
    pushPopup(state, data) {
      state.popups = [...state.popups, data]
    },
    shiftPopup(state) {
      state.popups = state.popups.slice(1)
    },
    confirm(state, result) {
      state.dlgConfirm.resolve(result)
      state.dlgConfirm = null
    },
    doConfirm(state, data) {
      state.dlgConfirm = data
    },
    prompt(state, result) {
      state.dlgPrompt.resolve(result)
      state.dlgPrompt = null
    },
    doPrompt(state, data) {
      state.dlgPrompt = data
    }
  },
  actions: {
    popup(context, data) {
      const { text, type } = typeof data === 'string'
        ? { text: data, type: 'info' }
        : data
      context.commit('pushPopup', { text, type })
      setTimeout(() => {
        context.commit('shiftPopup')
      }, 3000)
    },
    /* @param data = { text, header, type } */
    confirm(context, data) {
      return new Promise((resolve, reject) => {
        const { text, type, header } = typeof data === 'string'
          ? { text: data, type: 'info', header: 'Confirmation required' }
          : data
        context.commit('doConfirm', { text, type, header, resolve })
      })
    },
    /* @param data = { text, header, type } */
    prompt(context, data) {
      return new Promise((resolve, reject) => {
        const { text, type, header } = typeof data === 'string'
          ? { text: data, type: 'info', header: 'Input required' }
          : data
        context.commit('doPrompt', { text, type, header, resolve })
      })
    }
  }
}

export default module
