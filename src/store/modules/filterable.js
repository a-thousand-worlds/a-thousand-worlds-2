import * as slugify from '@sindresorhus/slugify'

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
    filtered: state => (items, tagName = 'tags') => {
      if (!state.loaded) return []

      if (state.filters.length === 0) return items

      return items.filter(item =>
        state.filters.every(tag => {
          const list = Array.isArray(item[tagName]) ? item[tagName] :
            typeof item[tagName] === 'object' ? Object.keys(item[tagName]) :
            []
          return list.includes(tag)
        })
      )
    }
  },
  actions: {
    setFiltersFromUrl({ state, commit, rootGetters }, type) {
      const urlParams = new URLSearchParams(window.location.search)
      const filters = (urlParams.get('filters') || '').split(',')

      if (filters.length > 0) {
        const tags = rootGetters[`tags/${type}/list`]()
        const tagsSelected = filters
          .map(filter => tags.find(tag => slugify(tag.tag) === filter))
          .filter(x => x)
        commit('setFilters', tagsSelected.map(tag => tag.id))
      }
      else {
        commit('resetFilters')
      }

    },
  },
})

export default module
