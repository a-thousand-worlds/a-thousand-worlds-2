import { createStore } from 'vuex'

import alert from '@/store/alert'
import books from '@/store/books'
import content from '@/store/content'
import creators from '@/store/creators'
import invites from '@/store/invites'
import submissions from '@/store/submissions'
import tags from '@/store/tags'
import ui from '@/store/ui'
import user from '@/store/user'
import users from '@/store/users'

const store = createStore({
  modules: {
    alert,
    books,
    content,
    creators,
    invites,
    submissions,
    tags,
    ui,
    user,
    users,
  },
  state: {
    auth: false,
  },
  actions: {
    async subscribe({ state, dispatch, commit }) {
      dispatch('books/subscribe')
      dispatch('content/subscribe')
      dispatch('creators/subscribe')
      dispatch('invites/subscribe')
      dispatch('submissions/subscribe')
      dispatch('tags/subscribe')
      dispatch('user/subscribe')
      dispatch('users/subscribe')
    },

  }
})

window.store = store

export default store
