import bookTags from '@/store/bookTags'
import bundleTags from '@/store/bundleTags'
import peopleTags from '@/store/peopleTags'

const module = {
  namespaced: true,
  modules: {
    books: bookTags,
    bundles: bundleTags,
    people: peopleTags,
  },
  state: {
    loaded: false,
  },
  mutations: {
    setLoaded(state) {
      state.loaded = true
    }
  },
  actions: {
    async subscribe({ dispatch, commit }) {
      await dispatch('books/subscribe')
      await dispatch('bundles/subscribe')
      await dispatch('people/subscribe')
      commit('setLoaded')
    }
  },
}

export default module
