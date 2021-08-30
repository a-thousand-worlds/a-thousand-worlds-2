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
     * Gets a sorted list of standalone top level tags with no subtags.
     *
     * @param type    books | people | bundles
     * */
    topLevel: (state, getters, rootState, rootGetters) => type => {
      const allTags = rootGetters[`tags/${type}/listSorted`]()
      const subTags = allTags.filter(tag => tag.parent)
      return allTags.filter(
        tag =>
          // top level
          !tag.parent &&
          // does not have any subtags
          !subTags.some(subtag => subtag.parent === tag.id),
      )
    },

    /** Gets a sorted list of all subtags of a parent tag. */
    subtags: (state, getters, rootState, rootGetters) => (type, parentTagName) => {
      const allTags = rootGetters[`tags/${type}/listSorted`]()
      const parent = allTags.find(tag => tag.tag === parentTagName)
      return allTags.filter(subtag => subtag.parent === parent.id)
    },
  },
}

export default module
