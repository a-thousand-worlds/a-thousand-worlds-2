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
    toggleBookmarks: (state, next) => {
      state.bookmarksOpen = next
    }
  }
}

export default module
