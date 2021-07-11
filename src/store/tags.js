import mergeOne from '@/util/mergeOne'
import managed from '@/store/modules/managed'
import sortable from '@/store/modules/sortable'

const module = {
  namespaced: true,
  modules: {
    books: mergeOne(managed('tags/books'), sortable()),
    bundles: mergeOne(managed('tags/bundles'), sortable()),
    people: mergeOne(managed('tags/people'), sortable()),
  },
  actions: {
    async subscribe({ dispatch, commit }, options = {}) {
      dispatch('books/subscribe', options.books)
      dispatch('bundles/subscribe', options.bundles)
      dispatch('people/subscribe', options.people)
    },
  },
}

export default module
