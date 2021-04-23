import { createStore } from 'vuex'
import books from '@/store/books'
import bundles from '@/store/bundles'
import content from '@/store/content'
import debug from '@/store/debug'
import people from '@/store/people'
import invites from '@/store/invites'
import submissions from '@/store/submissions'
import tags from '@/store/tags'
import ui from '@/store/ui'
import user from '@/store/user'
import users from '@/store/users'

const hour = Math.floor(Date.now() / 1000 / 60 / 60)

const store = createStore({
  modules: {
    books,
    bundles,
    content,
    debug,
    invites,
    people,
    submissions,
    tags,
    ui,
    user,
    users,
  },
  state: {
    auth: false,
    theme: hour % 4 + 1
  },
  actions: {

    async subscribe({ state, dispatch, commit }) {

      // shuffle by tag weight
      const shuffle = type => {
        // if (!state[type].loaded || !state.tags[type].loaded) return
        commit(`${type}/shuffle`, {
          idProp: type === 'people' ? 'identities' : 'tags',
          weights: state.tags[type].data
        })
      }

      if (window.dbcache) {
        if (window.dbcache.content) dispatch('content/loadCache', window.dbcache.content)
        if (window.dbcache.books) {
          dispatch('books/loadCache', window.dbcache.books)
          shuffle('books')
        }
        if (window.dbcache.people) {
          dispatch('people/loadCache', window.dbcache.people)
          shuffle('people')
        }
        if (window.dbcache.tags) {
          if (window.dbcache.tags.books) dispatch('tags/books/loadCache', window.dbcache.tags.books)
          if (window.dbcache.tags.people) dispatch('tags/people/loadCache', window.dbcache.tags.people)
          if (window.dbcache.tags.bundles) dispatch('tags/bundles/loadCache', window.dbcache.tags.bundles)
        }
      }

      dispatch('bundles/subscribe')
      dispatch('content/subscribe')
      dispatch('invites/subscribe')
      dispatch('submissions/subscribe')
      dispatch('user/subscribe')
      dispatch('users/subscribe')

      // subscribe to books and people and shuffle on load
      /**/
      dispatch('books/subscribe', { onValue: () => shuffle('books') })
      dispatch('people/subscribe', { onValue: () => shuffle('people') })
      dispatch('tags/subscribe', { people: { onValue: () => {
        shuffle('books')
        shuffle('people')
      } } })
      /**/

    },

  }
})

window.store = store

export default store
