<script>
import firebase from '../firebase'

export default {
  name: 'LogInPage',
  created() {
    firebase.auth().signOut()
    setTimeout(() => {
      // eslint-disable-next-line fp/no-mutating-methods
      this.$router.push({ name: 'Home' })
    }, 0)
  }
}

</script>

<template>
<div class="level">
  <div class="block">
    <h1 class="title">LogOut</h1>
  </div>
  <div class="block">
    <p>Thanks! See you again!</p>
  </div>
</div>

</template>
