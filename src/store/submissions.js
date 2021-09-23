import bookSubmissions from '@/store/submissions/books'
import bundleSubmissions from '@/store/submissions/bundles'
import peopleSubmissions from '@/store/submissions/people'

const module = {
  namespaced: true,
  modules: {
    books: bookSubmissions,
    bundles: bundleSubmissions,
    people: peopleSubmissions,
  },
  actions: {
    async reset({ dispatch }) {
      dispatch('books/reset')
      dispatch('bundles/reset')
      dispatch('people/reset')
    },
    async subscribe({ dispatch }) {
      dispatch('books/subscribe')
      dispatch('bundles/subscribe')
      dispatch('people/subscribe')
    },
  },
}

export default module
