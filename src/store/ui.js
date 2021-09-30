import uid from '@/util/chronouid'

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
    /** Returns an error handler that shows the error in an error popup. Also logs the full error object to the console. */
    handleError(context, e) {
      console.error(e)
      context.dispatch('popup', {
        type: 'error',
        text: typeof e === 'object' ? e.message : e,
        autoclose: false,
      })
    },
    popup(context, data) {
      const { text, type } = typeof data === 'string' ? { text: data, type: 'info' } : data
      const typeClasses = { error: 'danger' }
      const id = uid()
      context.commit('pushPopup', { id, text, type: typeClasses[type] || type })

      if (data.autoclose !== false) {
        setTimeout(() => {
          context.commit('closePopup', id)
        }, 3000)
      }

      return id
    },
    close(context, id) {
      context.commit('closePopup', id)
    },
    /* @param data = { text, header, type } */
    confirm(context, data) {
      return new Promise((resolve, reject) => {
        const { text, type, header } =
          typeof data === 'string'
            ? { text: data, type: 'info', header: 'Confirmation required' }
            : data
        context.commit('doConfirm', { text, type, header, resolve })
      })
    },
    /* @param data = { text, header, type } */
    prompt(context, data) {
      return new Promise((resolve, reject) => {
        const { text, type, header } =
          typeof data === 'string' ? { text: data, type: 'info', header: 'Input required' } : data
        context.commit('doPrompt', { text, type, header, resolve })
      })
    },
  },
}

export default module
