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
      console.log('ui/popup', text, type)
      context.commit('pushPopup', { text, type })
      setTimeout(() => {
        context.commit('shiftPopup')
      }, 3000)
    },
    /* @param data = { text, header, type } */
    confirm(context, data) {
      return new Promise((resolve, reject) => {
        context.commit('doConfirm', { ...data, resolve })
      })
    },
    /* @param data = { text, header, type } */
    prompt(context, data) {
      return new Promise((resolve, reject) => {
        context.commit('doPrompt', { ...data, resolve })
      })
    }
  }
}

export default module
