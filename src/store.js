import { createStore } from 'vuex'
import firebase from './firebase'

const store = createStore({
  state: {
    stage0: {
      loading: true,
      loaded: false
    },
    loading: false,
    user: null
  },
  mutations: {
    setUser(ctx,u)
    {
      ctx.user = u
    }
  },
  actions: {
    
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
    console.log('auth!',u)
    store.commit('setUser',u)
  } else {
    console.log('out!')
    store.commit('setUser',null)
  }
})


export default store
