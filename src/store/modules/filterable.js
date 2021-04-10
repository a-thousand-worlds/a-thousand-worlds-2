import * as slugify from '@sindresorhus/slugify'
import router from '@/router'
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
      state.filters = state.filters.some(activeFilter => activeFilter.id === filter.id && (!activeFilter.submenu || activeFilter.submenu.id === filter.submenu?.id))
        ? state.filters.filter(activeFilter => activeFilter.id !== filter.id)
        : [...filter.submenu ? state.filters.filter(activeFilter => activeFilter.id !== filter.id) : state.filters, filter]
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
          const key = specialFilters.people.some(({ id }) => id === filter.id) ? 'title'
            : tagName
          const value = item[key]
          const itemFilters = Array.isArray(value) ? value
            : typeof value === 'string' ? [value]
            : typeof value === 'object' ? Object.keys(value)
            : []
          return itemFilters.some(itemFilter => itemFilter === (filter.submenu?.id || filter.id))
        })
      )
    }
  },
  actions: {
    resetFilters({ commit, dispatch }) {
      commit('resetFilters')
      dispatch('updateUrl')
    },
    setFilters({ commit, dispatch }, filters) {
      commit('setFilters', filters)
      dispatch('updateUrl')
    },
    setFiltersFromUrl({ state, commit, rootGetters }, type) {
      const urlParams = new URLSearchParams(window.location.search)
      const urlFilters = (urlParams.get('filters') || '').split(',')

      if (urlFilters.length > 0) {
        const tags = rootGetters[`tags/${type}/list`]()
        const tagsSelected = urlFilters
          .map(urlFilter => {
            const [filterKey] = urlFilter.split('/')
            const activeFilter = tags.find(tag => slugify(tag.tag) === filterKey)
            return activeFilter
          })
          .filter(x => x)
        commit('setFilters', tagsSelected)
      }
      else {
        commit('resetFilters')
      }

    },
    toggleFilter({ commit, dispatch }, filter) {
      commit('toggleFilter', filter)
      dispatch('updateUrl')
    },
    updateUrl({ state }) {
      router.replace({
        ...router.currentRoute,
        query: state.filters.length > 0 ? {
          filters: state.filters.map(activeFilter => slugify(activeFilter.tag) + (activeFilter.submenu ? `/${slugify(activeFilter.submenu.text)}` : '')).join(',')
        } : {}
      })
    }
  },
})

export default module
