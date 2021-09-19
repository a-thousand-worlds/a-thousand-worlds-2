/** Vuex module for authentication and current user */
import set from 'lodash/set'
// import firebase from '@/firebase'
import can from '@/util/can'
import mergeOne from '@/util/mergeOne'
import collection from '@/store/modules/collection'
import router from '../router'
const firebaseImport = () => import(/* webpackChunkName: "firebase" */ '@/firebase')

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
  state: {
    impersonate: null,
    user: null,
    nextPromise: null,
  },
  mutations: {
    impersonate: (state, role) => {
      state.impersonate = role
      if (role) {
        localStorage.setItem('impersonate', role)
      } else {
        localStorage.removeItem('impersonate')
      }
    },
    setNextPromise(state, accept) {
      state.nextPromise = accept
    },
    setUser: (state, user) => {
      state.user = user
      if (user && !state.impersonate) {
        state.impersonate = localStorage.getItem('impersonate')
      }
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
    },
  },
  actions: {
    // next subscription used by router on access validation
    next(ctx) {
      return new Promise((resolve, reject) => {
        ctx.commit('setNextPromise', resolve)
      })
    },

    async login(ctx, data) {
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      return firebase.auth().signInWithEmailAndPassword(data.email, data.password)
    },

    async logout(ctx) {
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      firebase.auth().signOut()
      ctx.commit('setUser', null)
      ctx.commit('ui/setLastVisited', new Date(), { root: true })

      // TODO: global clear mutation
      // ctx.commit('clear', null, { root: true })

      router.push({ name: 'Login' })
    },

    async signup({ commit, dispatch, rootState }, { code, email, name, password }) {
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, password)

      commit('setUser', auth2user(user))
      // save profile to user record
      await dispatch('saveProfile', {
        name,
        email,
        ...(typeof navigator !== 'undefined' && navigator.userAgent
          ? { userAgent: navigator.userAgent }
          : null),
        ...(code ? { code } : null),
      })

      return user
    },

    // keep it here as 'user related'
    async passwordReset(ctx, email) {
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      return firebase.auth().sendPasswordResetEmail(email)
    },

    /** Save to the currently logged in user */
    save(ctx, { path, value }) {
      const userNew = { ...ctx.state.user }
      set(userNew, path, value)
      ctx.commit('setUser', userNew)
      return usersModule.actions.save(ctx, {
        path: `${ctx.state.user.uid}/${path}`,
        value,
      })
    },

    async saveProfile(ctx, profile) {
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      const ref = firebase.database().ref(`users/${ctx.state.user.uid}/profile`)
      await ref.set(profile)
      ctx.commit('setProfile', profile)
    },

    // See: MessageSequence component
    async updateMessageSequence(ctx, { name, key, value }) {
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      const ref = firebase.database().ref(`users/${ctx.state.user.uid}/profile/messageSequence`)
      await ref.update({
        [`${name}/${key}`]: value,
      })
      ctx.commit('setProfile', {
        ...ctx.state.user.profile,
        messageSequence: {
          ...ctx.state.user.profile.messageSequence,
          [name]: {
            ...ctx.state.user.profile.messageSequence?.[name],
            [key]: value,
          },
        },
      })
    },

    async updateProfile(ctx, values) {
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
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
      } else {
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
      firebaseImport().then(firebasem => {
        const firebase = firebasem.default

        firebase.auth().onAuthStateChanged(function (user) {
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
                  ...val.roles,
                },
              })

              // it is possible that signup redirects to the dashboard before the roles are set on the server-side
              // fetch the role from the invite, otherwise the user will get an not authorized error
              if (val.profile.code && !val.roles) {
                const inviteRef = firebase.database().ref(`invites/${val.profile.code}`)
                inviteRef.once('value', inviteSnap => {
                  const invite = inviteSnap.val()
                  if (invite?.role) {
                    // set role locally
                    // the user is not authorized to change their role on the server
                    ctx.commit('setRoles', {
                      authorized: true,
                      [invite.role]: true,
                    })
                  }
                })
              }
            })

            // subscribe to profile
            const profileRef = firebase.database().ref(`users/${u.uid}/profile`)
            profileRef.on('value', snap => {
              const profile = defaultProfile(u, snap.val())
              ctx.commit('setProfile', profile)

              // subscribe to users once logged in if user can edit content
              // they cannot be subscribed to before authorized login
              // maybe there is a better way then setTimeout, but without it state does not yet have valid user
              setTimeout(() => {
                if (!ctx.rootState.users?.loaded && can(ctx.rootState, 'editContent')) {
                  ctx.dispatch('users/subscribe', {}, { root: true })
                }
              })
            })

            // subscribe to roles
            const rolesRef = firebase.database().ref(`users/${u.uid}/roles`)
            rolesRef.on('value', snap => {
              const roles = defaultProfile(u, snap.val())
              ctx.commit('setRoles', roles)
            })
          } else {
            ctx.commit('setUser', null)
          }
        })
      })
    },

    async updateEmail(ctx, email) {
      const firebasem = await firebaseImport()
      const firebase = firebasem.default
      const user = firebase.auth().currentUser
      if (user.email !== email) {
        await user.updateEmail(email)
      }
    },
  },
})

export default module
