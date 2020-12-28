import { createStore } from 'vuex'

import alert from '@/store/alert'
import books from '@/store/books'
import bookSubmissions from '@/store/bookSubmissions'
import content from '@/store/content'
import creators from '@/store/creators'
import invites from '@/store/invites'
import tags from '@/store/tags'
import ui from '@/store/ui'
import user from '@/store/user'
import users from '@/store/users'

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
    auth: false,
    loaded: false,
  },
  mutations: {
    setNAP(state, p) {
      state.noAccessPath = p
    },
    setLoaded(state) {
      state.loaded = true
    }
  },
  actions: {
    // start
    async load({ state, dispatch, commit }) {
      await dispatch('books/subscribe')
      await dispatch('bookSubmissions/subscribe')
      await dispatch('content/subscribe')
      await dispatch('creators/subscribe')
      await dispatch('invites/subscribe')
      await dispatch('tags/subscribe')
      await dispatch('user/subscribe')
      await dispatch('users/subscribe')
      commit('setLoaded')
    },

  }
})

window.store = store

export default store
