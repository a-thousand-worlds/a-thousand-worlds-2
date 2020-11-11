<script>
import firebase from '../firebase'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

const uiConfig = {
  signInFlow: 'popup',
  //signInSuccessUrl: '/',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: true
    },
  ],
  callbacks: {
    signInSuccess: function() {
      //console.log('currentUser!',currentUser,credentials)
      return false
    }
  }
}


export default {
  name: 'LogInPage',
  created() {
    setTimeout(()=>{
      let ui =  firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth())
      ui.start('#firebaseui',uiConfig)
    },0)
  },
  watch: {
    "$store.state.user"(next,prev) {
      if (!prev&&!!next)
        this.$router.push({name:'Profile'})
      //console.log('user next',next,prev)
    }
  }
}

</script>

<template>
<div class="level">
  <div class="block">
    <h1 class="title">LogIn</h1>
  </div>
  <div class="block">
    <div id="firebaseui"></div>
  </div>
</div>

</template>

<style>

</style>
