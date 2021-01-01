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
  },
  mutations: {
    setNAP(state, p) {
      state.noAccessPath = p
    },
  },
  actions: {
    async subscribe({ state, dispatch, commit }) {
      dispatch('books/subscribe')
      dispatch('bookSubmissions/subscribe')
      dispatch('content/subscribe')
      dispatch('creators/subscribe')
      dispatch('invites/subscribe')
      dispatch('tags/subscribe')
      dispatch('user/subscribe')
      dispatch('users/subscribe')
    },

  }
})

window.store = store

export default store
