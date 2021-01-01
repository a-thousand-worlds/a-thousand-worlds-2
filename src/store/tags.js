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
  actions: {
    async subscribe({ dispatch, commit }) {
      dispatch('books/subscribe')
      dispatch('bundles/subscribe')
      dispatch('people/subscribe')
    }
  },
}

export default module
