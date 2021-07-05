import { createStore } from 'vuex'
import books from '@/store/books'
import bundles from '@/store/bundles'
import content from '@/store/content'
import debug from '@/store/debug'
import invites from '@/store/invites'
import people from '@/store/people'
import structuredData from '@/store/structuredData'
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
    structuredData,
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

    // loads all collections from the cache
    loadCache({ state, dispatch }) {
      if (window.dbcache) {
        if (window.dbcache.content) {
          dispatch('content/loadCache', window.dbcache.content)
        }
        if (window.dbcache.tags) {
          if (window.dbcache.tags.books) dispatch('tags/books/loadCache', window.dbcache.tags.books)
          if (window.dbcache.tags.people) dispatch('tags/people/loadCache', window.dbcache.tags.people)
          if (window.dbcache.tags.bundles) dispatch('tags/bundles/loadCache', window.dbcache.tags.bundles)
        }
        // load books and people after tags are loaded so that tag weights are loaded before shuffling
        if (window.dbcache.books) {
          dispatch('books/loadCache', window.dbcache.books)
          dispatch('shuffle', 'books')
        }
        if (window.dbcache.people) {
          dispatch('people/loadCache', window.dbcache.people)
          dispatch('shuffle', 'people')
        }
      }
      else {
        console.warn('The cache has not been generated. Run `npm run update:localcache .env.local` to build the cache from Firebase. Once deployed, the cache will be regenerated directly on Firebase hosting via rebuildCache.js if needed.')
      }
    },

    // shuffle a collection by tag weight of the corresponding tags
    shuffle({ state, commit }, type) {
      commit(`${type}/shuffle`, {
        idProp: type === 'people' ? 'identities' : 'tags',
        weights: state.tags[type].data
      })
    },

    // subscribes to all collections
    async subscribe({ state, dispatch, commit }) {

      dispatch('bundles/subscribe')
      dispatch('content/subscribe')
      dispatch('invites/subscribe')
      dispatch('submissions/subscribe')
      dispatch('user/subscribe')
      dispatch('users/subscribe')

      // subscribe to books and people and shuffle on load
      dispatch('books/subscribe', { onValue: () => dispatch('shuffle', 'books') })
      dispatch('people/subscribe', { onValue: () => dispatch('shuffle', 'people') })
      dispatch('tags/subscribe', { people: { onValue: () => {
        dispatch('shuffle', 'books')
        dispatch('shuffle', 'people')
      } } })

    },

  }
})

window.store = store

export default store
