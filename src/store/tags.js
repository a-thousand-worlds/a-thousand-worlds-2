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
  getters: {
    /**
     * Gets an unsorted list of standalone top level tags with no subtags.
     *
     * @param type    books | people | bundles
     * */
    topLevel: (state, getters, rootState) => type => {
      const allTags = Object.values(state[type].data || {})
      const subTags = allTags.filter(tag => tag.parent)
      return allTags.filter(
        tag =>
          // top level
          !tag.parent &&
          // does not have any subtags
          !subTags.some(subtag => subtag.parent === tag.id),
      )
    },
  },
}

export default module
