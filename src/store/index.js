import { createStore } from 'vuex'
import { firebaseGet } from '@/utils'

import alert from '@/store/alert'
import invites from '@/store/invites'
import content from '@/store/content'
import books from '@/store/books'
import tags from '@/store/tags'
import ui from '@/store/ui'
import user from '@/store/user'
import users from '@/store/users'
import creators from '@/store/creators'
import bookSubmissions from '@/store/bookSubmissions'

const store = createStore({
  modules: {
    alert,
    books,
    bookSubmissions,
    content,
    creators,
    invites,
    tags,
    ui,
    user,
    users,
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
      await ctx.dispatch('content/subscribe')
      await ctx.dispatch('invites/subscribe')
      await ctx.dispatch('users/subscribe')
      ctx.commit('setStage0Load')
    },

  }
})

window.store = store

export default store
