import { createStore } from 'vuex'

import alert from '@/store/alert'
import books from '@/store/books'
import bundles from '@/store/bundles'
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
    bundles,
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
      dispatch('bundles/subscribe')
      dispatch('content/subscribe')
      dispatch('invites/subscribe')
      dispatch('submissions/subscribe')
      dispatch('tags/subscribe')
      dispatch('user/subscribe')
      // TODO rebuild to
      // 1. fix leaking of users profile and roles data to everyone
      // 2. not all users table is requires - only contributors
      dispatch('users/subscribe')

      // shuffle
      dispatch('creators/subscribe', value => {
        console.log('onValue', value)
        return value
      })

    },

  }
})

window.store = store

export default store
