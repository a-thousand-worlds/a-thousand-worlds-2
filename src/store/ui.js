const module = {
  namespaced: true,
  state: () => ({
    busy: false,
    bookmarksOpen: false,
    viewMode: 'covers'
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
    }
  }
}

export default module
