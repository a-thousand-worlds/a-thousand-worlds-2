import { v4 as uid } from 'uuid'

const module = {
  namespaced: true,
  state: () => ({
    busy: false,
    pageLoading: false,
    bookmarksOpen: false,
    viewMode: 'covers',
    dlgConfirm: null,
    popups: [],
    // updated in Home component beforeRouteLeave
    // disable lastVisited persistance
    // lastVisited: localStorage.getItem('lastVisited'),
  }),
  mutations: {
    setBusy: (state, value) => {
      state.busy = value
    },
    setPageLoading: (state, value) => {
      state.pageLoading = value
    },
    setBookmarksOpen: (state, value) => {
      state.bookmarksOpen = value
    },
    setLastVisited: (state, value) => {
      state.lastVisited = value
      // disable lastVisited persistance
      // localStorage.setItem('lastVisited', value)
    },
    setViewMode: (state, value) => {
      state.viewMode = value
    },
    closePopup(state, id) {
      state.popups = state.popups.filter(popup => popup.id !== id)
    },
    pushPopup(state, value) {
      state.popups = [...state.popups, value]
    },
    confirm(state, result) {
      state.dlgConfirm.resolve(result)
      state.dlgConfirm = null
    },
    doConfirm(state, value) {
      state.dlgConfirm = value
    },
    prompt(state, result) {
      state.dlgPrompt.resolve(result)
      state.dlgPrompt = null
    },
    doPrompt(state, value) {
      state.dlgPrompt = value
    },
  },
  actions: {
    popup(context, data) {
      const { text, type } = typeof data === 'string'
        ? { text: data, type: 'info' }
        : data
      const id = uid()
      context.commit('pushPopup', { id, text, type })
      setTimeout(() => {
        context.commit('closePopup', id)
      }, 3000)
      return id
    },
    close(context, id) {
      context.commit('closePopup', id)
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
