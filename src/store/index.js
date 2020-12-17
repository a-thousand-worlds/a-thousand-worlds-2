import { createStore } from 'vuex'
import collectionModule from '@/store/collection/module'
import invites from '@/store/invites'
import books from '@/store/books'
import tags from '@/store/tags'
import ui from '@/store/ui'
import user from '@/store/user'
import creators from '@/store/creators'
import bookSubmissions from '@/store/bookSubmissions'
import { firebaseGet } from '@/utils'

const store = createStore({
  modules: {
    content: collectionModule('content'),
    invites,
    books,
    tags,
    ui,
    user,
    creators,
    bookSubmissions,
    users: collectionModule('users'),
  },
  state: {
    noAccessPath: '',
    stage0: {
      auth: false,
      loaded: false
    },
  },
  mutations: {
    setNAP(ctx, p) {
      ctx.noAccessPath = p
    },
    setStage0Load(ctx) {
      ctx.stage0.loaded = true
    }
  },
  actions: {

    // this method doesn't use store to keep values
    // it used only by administrators
    loadContributorsSubmissions(ctx) {
      return firebaseGet('submits')
    },
    // -- same
    loadContributorProfile(ctx, uid) {
      return firebaseGet(`users/${uid}/profile`)
    },

    // start
    async loadStage0(ctx) {
      await ctx.dispatch('user/subscribe')
      await ctx.dispatch('creators/subscribe')
      await ctx.dispatch('tags/subscribe')
      await ctx.dispatch('books/subscribe')
      await ctx.dispatch('content/load')
      await ctx.dispatch('invites/subscribe')
      await ctx.dispatch('users/subscribe')
      ctx.commit('setStage0Load')
    },

  }
})

window.store = store

export default store
