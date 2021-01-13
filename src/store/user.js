/** Vuex module for authentication and current user */
import firebase from '@/firebase'

const module = {
  namespaced: true,
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
    setProfile: (ctx, p) => {
      if (ctx.user) ctx.user.profile = p
    },
    setRoles: (ctx, list) => {
      if (ctx.user) ctx.user.roles = list
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

    async signup({ commit, dispatch, rootState }, { code, email, name, organization, otherEngagementCategory, password }) {
      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, password)
      await commit('setUser', { uid: user.uid }, { root: true })

      // add role from signup code
      const invite = rootState.invites.data[code]
      const roles = invite ? {
        roles: {
          [invite.role]: true
        }
      } : null

      // save profile to user record
      await dispatch('saveProfile', {
        email,
        code,
        name,
        organization,
        otherEngagementCategory,
        ...roles,
      })

      // mark signup code as used
      await firebase.database().ref(`invites/${code}/used`).set(true)

      return user
    },

    // keep it here as 'user related'
    passwordReset(ctx, email) {
      return firebase.auth().sendPasswordResetEmail(email)
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
        ...ctx.user.profile,
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

    subscribe: store => {

      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          const u = {}
          u.displayName = user.displayName
          u.email = user.email
          u.emailVerified = user.emailVerified
          u.photoURL = user.photoURL
          u.isAnonymous = user.isAnonymous
          u.uid = user.uid
          u.providerData = user.providerData
          const defaultProfile = {
            email: u.email,
            name: '',
            bundles: [],
            bookmarks: {},
            submissions: {},
            draftBooks: [],
            draftBundles: []
          }
          u.profile = defaultProfile
          u.roles = {}
          const userRef = firebase.database().ref(`users/${u.uid}`)
          userRef.on('value', snap => {
            u.profile = { ...defaultProfile, ...snap.val()?.profile }
            u.roles = snap.val()?.roles || {}
            if (!u.roles.authorized) {
              u.roles.authorized = true
            }
            store.commit('setUser', u)
          })
          const profileRef = firebase.database().ref(`users/${u.uid}/profile`)
          profileRef.on('value', snap => {
            const profile = { ...defaultProfile, ...snap.val() }
            store.commit('setProfile', profile)
          })
        }
        else {
          store.commit('setUser', null)
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
}

export default module
