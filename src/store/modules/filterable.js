const module = () => ({
  state: {
    filters: [],
  },
  mutations: {
    resetFilters(state) {
      state.filters = []
    },
    toggleFilter(state, filter) {
      state.filters = state.filters.includes(filter)
        ? state.filters.filter(x => x !== filter)
        : [...state.filters, filter]
    },
    setFilters(state, filters) {
      state.filters = filters
    },
  },
  getters: {
    filtered: state => items => {
      if (!state.loaded) return []

      if (state.filters.length === 0) return items

      return items.filter(item =>
        state.filters.every(tag => {
          const list = Array.isArray(item.tags) ? item.tags :
            typeof item.tags === 'object' ? Object.keys(item.tags) :
            []
          return list.includes(tag)
        })
      )
    }
  },
})

export default module
