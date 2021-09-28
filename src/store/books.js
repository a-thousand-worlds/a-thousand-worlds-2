// import firebase from '@/firebase'
import mergeOne from '@/util/mergeOne'
import managed from '@/store/modules/managed'
import filterable from '@/store/modules/filterable'
import shuffleable from '@/store/modules/shuffleable'
const firebaseImport = () => import(/* webpackChunkName: "firebase" */ '@/firebase')

const moduleFilterable = filterable()
const module = mergeOne(managed('books'), moduleFilterable, shuffleable(), {
  getters: {
    // override filtered from filterable module to filter shuffled
    filtered: (state, getters, rootState) =>
      moduleFilterable.getters.filtered(state)(state.shuffled, 'tags'),
  },
  actions: {
    // override setFiltersFromUrl from filterable module to use isbn instead id
    setFiltersFromUrl: context => {
      moduleFilterable.actions.setFiltersFromUrl(context)

      // router.currentRoute._value has not been populated yet when this is called
      const urlParams = new URLSearchParams(window.location.search)
      const isbns = urlParams.get('books')?.split(',') || []

      const ids = isbns.map(isbn => context.getters.findBy('isbn', isbn)?.id).filter(x => x)

      if (ids.length > 0) {
        context.commit('setIdFilters', ids)
      }
    },

    remove: async (context, bookId) => {
      if (!bookId) throw new Error('bookId required')

      const submission = context.rootGetters['submissions/books/findBy']('bookId', bookId)
      if (submission) {
        // set submit record status to deleted
        context.dispatch(
          'submissions/books/update',
          {
            path: submission.id,
            value: { status: 'deleted' },
          },
          { root: true },
        )

        // set user/submission to deleted
        const userSubmissions = context.rootGetters['users/get'](submission.createdBy).profile
          ?.submissions
        if (userSubmissions) {
          context.dispatch(
            'users/update',
            {
              path: `${submission.createdBy}/profile/submissions`,
              value: { [submission.id]: 'deleted' },
            },
            { root: true },
          )
        }
      }

      // delete book
      // TODO: archive instead of completely deleting
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      await firebase.database().ref(`books/${bookId}`).remove()
    },
  },
})

export default module
