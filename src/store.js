import { createStore } from 'vuex'
import firebase from './firebase'
import dayjs from 'dayjs'
import { v4 } from 'uuid'

const store = createStore({
  state: {
    stage0: {
      auth: false,
      loaded: false
    },
    loading: false,
    user: null,
    tags: {},
    sortedTags: [],
    books: [],
    bundles: []
  },
  mutations: {
    setUser(ctx, u) {
      ctx.user = u
      ctx.stage0.auth = true
    },
    setUserProfile(ctx, p) {
      if (ctx.user) {
        ctx.user.profile = p
      }
    },
    setUserRoles(ctx, list) {
      if (ctx.user) {
        ctx.user.roles = list
      }
    },
    setStage0Load(ctx) {
      ctx.stage0.loaded = true
    },
    setTags(ctx, list) {
      ctx.tags = list
    },
    setSortedTags(ctx, list) {
      ctx.sortedTags = list
    },
    setBooks(ctx, list) {
      ctx.books = list
    }
  },
  actions: {
    async addTag(ctx, tag) {
      // eslint-disable-next-line  fp/no-mutating-methods
      const id = v4()
      const ref = await firebase.database().ref(`tags/${id}`)
      // console.log('set ref', ref, id)
      const now = dayjs()
      await ref.set({
        id,
        tag: tag.tag,
        sortOrder: parseInt(tag.sortOrder) || 0,
        showOnFront: !!tag.showOnFront,
        created: now.format(),
        updated: now.format()
      })
      return await ctx.dispatch('loadTags')
    },
    async updateTag(ctx, data) {
      const ref = await firebase.database().ref(`tags/${data.id}`)
      const now = dayjs()
      // ref.once('value',s
      const val = await ref.once('value')
      const snap = val.val()
      console.log('update?', data, snap)
      snap.tag = data.tag
      snap.showOnFront = !!data.showOnFront
      snap.sortOrder = parseInt(data.sortOrder)
      snap.updated = now.format()
      if (!snap.created) {
        snap.created = now.format()
      }
      // console.log('set ref', ref, id)
      console.log('updating ', snap)
      await ref.set(snap)
      return await ctx.dispatch('loadTags')
    },
    async delTag(ctx, tagid) {
      const ref = await firebase.database().ref(`tags/${tagid}`)
      await ref.remove()
      return await ctx.dispatch('loadTags')
    },
    loadTags() {
      return new Promise((resolve, reject) => {
        firebase.database().ref('tags').once('value', snap => {
          console.log('tags', snap.val())
          const v = snap.val()
          store.commit('setTags', v)
          const tags = Object.keys(v).map(k => {
            return { ...v[k] }
          })
          // eslint-disable-next-line fp/no-mutating-methods
          const sorted = tags.sort((a, b) => {
            if (a.sortOrder === b.sortOrder) {
              return 0
            }
            return a.sortOrder > b.sortOrder ? 1 : -1
          })
          store.commit('setSortedTags', sorted)
          resolve()
        })
      })
    },
    loadBooks() {
      return new Promise((resolve, reject) => {
        firebase.database().ref('books').once('value', snap => {
          console.log('books', snap.val())
          store.commit('setBooks', snap.val())
          resolve()
        })
      })
    },
    async loadStage0(ctx) {
      await ctx.dispatch('loadTags')
      await ctx.dispatch('loadBooks')
      ctx.commit('setStage0Load')
    },
    async userLogin(ctx, credentials) {
      return firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
    },
    passwordReset(ctx, email) {
      return new Promise((resolve, reject) => {
        firebase.auth().sendPasswordResetEmail(email)
          .then(res => {
            console.log('reset res', res)
            resolve()
          })
          .catch(err => {
            console.log('reset erroe', err)
            reject(err)
          })
      })
    },
    async userRegister(ctx, credentials) {
      let ret = null
      // console.log('reg with', credentials)
      try {
        ret = await firebase.auth().createUserWithEmailAndPassword(credentials.email, credentials.password)
      }
      catch (err) {
        ret = null
        console.log('userregister error', err)
      }
      return ret
    }
  }
})

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
    u.profile = {
      email: u.email,
      firstName: '',
      lastName: '',
      bundles: [],
      submissions: []
    }
    u.roles = []
    const userRef = firebase.database().ref(`users/${u.uid}`)
    userRef.once('value', snap => {
      u.profile = snap.val().profile
      u.roles = snap.val().roles
      if (!u.roles) {
        u.roles = {}
      }
      if (!u.roles.authorized) {
        u.roles.authorized = true
      }
      store.commit('setUser', u)
    })
    /*
    const p = firebase.database().ref(`users/${u.uid}/profile`)
    console.log('auth!', u)
    const r = firebase.database().ref(`users/${u.uid}/roles`)
    r.once('value', snap => {
      console.log('roles snap', snap.val())
      if (Array.isArray(snap.val())) {
        store.commit('setUserRoles', snap.val())
      }
    })
    p.once('value', snap => {
      u.profile = snap.val()
      store.commit('setUserProfile', snap.val())
    })
    */
  }
  else {
    console.log('out!')
    store.commit('setUser', null)
  }
})

export default store
