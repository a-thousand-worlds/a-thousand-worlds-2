/** Vuex module for authentication and current user */
import _ from 'lodash'
import firebase from '@/firebase'
import mergeOne from '@/util/mergeOne'
import collection from '@/store/modules/collection'
import router from '../router'

function defaultProfile(user, profile = {}) {
  const def = {
    email: user.email,
    name: '',
    bundles: [],
    bookmarks: {},
    submissions: {},
    draftBooks: [],
    draftBundles: [],
  }
  return { ...def, ...profile }
}

function auth2user(dbUser) {
  return {
    roles: {},
    ...dbUser,
    profile: defaultProfile(dbUser),
  }
}

const usersModule = collection('users')
const module = mergeOne(usersModule, {
  state: () => ({
    user: null,
    nextPromise: null
  }),
  mutations: {
    setNextPromise(state, accept) {
      state.nextPromise = accept
    },
    setUser: (state, user) => {
      state.user = user
      if (state.nextPromise) {
        state.nextPromise(state.user)
        state.nextPromise = null
      }
    },
    setProfile: (state, profile) => {
      if (state.user) state.user.profile = profile
    },
    setRoles: (state, roles) => {
      if (state.user) state.user.roles = roles
    }
  },
  actions: {

    // next subscription used by router on access validation
    next(ctx) {
      return new Promise((resolve, reject) => {
        ctx.commit('setNextPromise', resolve)
      })
    },

    login(ctx, data) {
      return firebase.auth().signInWithEmailAndPassword(data.email, data.password)
    },

    logout(ctx) {
      firebase.auth().signOut()
      ctx.commit('setUser', null)
      ctx.commit('ui/setLastVisited', new Date(), { root: true })
      router.push({ name: 'Login' })
    },

    async signup({ commit, dispatch, rootState }, { code, email, name, identities, photo, affiliations, password }) {
      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, password)

      commit('setUser', auth2user(user))
      // save profile to user record
      await dispatch('saveProfile', {
        name,
        email,
        ...code ? { code } : null,
        ...identities ? { identities } : null,
        ...photo ? { photo } : null,
        ...affiliations?.organization ? { affiliations } : null,
      })

      return user
    },

    // keep it here as 'user related'
    passwordReset(ctx, email) {
      return firebase.auth().sendPasswordResetEmail(email)
    },

    /** Save to the currently logged in user */
    save(ctx, { path, value }) {
      const userNew = { ...ctx.state.user }
      _.set(userNew, path, value)
      ctx.commit('setUser', userNew)
      return usersModule.actions.save(ctx, {
        path: `${ctx.state.user.uid}/${path}`,
        value,
      })
    },

    async saveProfile(ctx, profile) {
      const ref = firebase.database().ref(`users/${ctx.state.user.uid}/profile`)
      await ref.set(profile)
      ctx.commit('setProfile', profile)
    },

    async updateProfile(ctx, values) {
      const ref = firebase.database().ref(`users/${ctx.state.user.uid}/profile`)
      await ref.update(values)
      ctx.commit('setProfile', {
        ...ctx.state.user.profile,
        ...values,
      })
    },

    async toggleBookmark(ctx, mark) {
      const profile = ctx.state.user.profile
      if (profile.bookmarks[mark.id]) {
        profile.bookmarks = Object.keys(profile.bookmarks)
          .filter(id => id !== mark.id)
          .reduce((acc, id) => ({ [id]: profile.bookmarks[id], ...acc }), {})
      }
      else {
        profile.bookmarks[mark.id] = mark.type
      }
      await ctx.dispatch('saveProfile', profile)
    },

    async clearBookmarks(ctx, mark) {
      // ctx.commit('ui/setBusy', true)
      const profile = ctx.state.user.profile
      profile.bookmarks = {}
      await ctx.dispatch('saveProfile', profile)
      // ctx.commit('ui/setBusy', false)
    },

    async saveBookSubmissionsDraft(ctx, draft) {
      // ctx.commit('ui/setBusy', true)
      const profile = ctx.state.user.profile
      profile.draftBooks = draft
      await ctx.dispatch('saveProfile', profile)
      // ctx.commit('ui/setBusy', false)
    },

    async saveBundleSubmissionsDraft(ctx, draft) {
      // ctx.commit('ui/setBusy', true)
      const profile = ctx.state.user.profile
      profile.draftBundle = draft
      await ctx.dispatch('saveProfile', profile)
      // ctx.commit('ui/setBusy', false)
    },

    async savePersonSubmissionDraft(ctx, draft) {
      const profile = ctx.state.user.profile
      profile.draftPerson = draft
      await ctx.dispatch('saveProfile', profile)
    },

    subscribe: ctx => {

      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          const u = auth2user(user)
          const userRef = firebase.database().ref(`users/${u.uid}`)

          // subscribe to user
          userRef.on('value', snap => {
            const val = snap.val() || { profile: {}, roles: {} }
            ctx.commit('setUser', {
              ...u,
              profile: defaultProfile(u, val.profile || {}),
              roles: {
                authorized: true,
                ...val.roles
              },
            })
          })

          // subscribe to profile
          const profileRef = firebase.database().ref(`users/${u.uid}/profile`)
          profileRef.on('value', snap => {
            const profile = defaultProfile(u, snap.val())
            ctx.commit('setProfile', profile)
          })

        }
        else {
          ctx.commit('setUser', null)
        }
      })

    },

    async updateEmail(ctx, email) {
      const user = firebase.auth().currentUser
      if (user.email !== email) {
        await user.updateEmail(email)
      }
    },

  }
})

export default module
