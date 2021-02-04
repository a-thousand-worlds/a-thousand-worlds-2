import * as slugify from '@sindresorhus/slugify'
import specialFilters from '@/store/constants/special-filters'

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

      if (!Array.isArray(state.filters) || state.filters.length === 0) return items

      return items.filter(item =>
        state.filters.every(filter => {
          // handle hardcoded special filters
          const key = specialFilters.people.some(({ id }) => id === filter) ? 'title' : tagName
          const value = item[key]
          const list = Array.isArray(value) || typeof value === 'string' ? value :
            typeof value === 'object' ? Object.keys(value) :
            []
          return list.includes(filter)
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
