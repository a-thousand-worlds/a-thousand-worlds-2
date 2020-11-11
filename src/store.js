import { createStore } from 'vuex'
import firebase from './firebase'

const store = createStore({
  state: {
    stage0: {
      auth: false,
      loaded: false
    },
    loading: false,
    user: null
  },
  mutations: {
    setUser(ctx,u)
    {
      ctx.user = u
      ctx.stage0.auth = true
    },
    setUserProfile(ctx,p)
    {
      if (ctx.user)
        ctx.user.profile = p
    },
    setUserRoles(ctx,list)
    {
      if (ctx.user)
        ctx.user.roles = list
    },
    setStage0Load(ctx)
    {
      ctx.stage0.loaded = true
    }
  },
  actions: {
    async loadBooks()
    {
    },
    async loadTags()
    {
    },
    async loadStage0(ctx) {
      await ctx.dispatch('loadTags')
      await ctx.dispatch('loadBooks')
      ctx.commit('setStage0Load')
    }
  }
})

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    let u = {}
    u.displayName = user.displayName;
    u.email = user.email;
    u.emailVerified = user.emailVerified;
    u.photoURL = user.photoURL;
    u.isAnonymous = user.isAnonymous;
    u.uid = user.uid;
    u.providerData = user.providerData;
    u.profile = {
      firstName: '',
      lastName: '',
      bundles: [],
      submissions: []
    }
    u.roles = []
    let p = firebase.database().ref(`users/${u.uid}/profile`)
    console.log('auth!',u)
    store.commit('setUser',u)
    let r = firebase.database().ref(`users/${u.uid}/roles`)
    r.once('value',snap=>{
      console.log('roles snap',snap.val())
      if (Array.isArray(snap.val()))
        store.commit('setUserRoles',snap.val())
    })
    p.once('value',snap=>{
      u.profile = snap.val()
      store.commit('setUserProfile',snap.val())
    })
  } else {
    console.log('out!')
    store.commit('setUser',null)
  }
})


export default store
