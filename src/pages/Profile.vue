<script>

export default {
  name: 'ProfilePage',
  created() {
    // console.log(this.$store.state.user.photoUrl)
  },
  computed: {
    username() {
      if (!this.$store.state.user) {
        return ''
      }
      if (this.$store.state.user.profile.firstName.length) {
        return this.$store.state.user.profile.firstName + ' ' + this.$store.state.user.profile.lastName
      }
      return this.$store.state.user.profile.email
    }
  }
}

</script>

<template>

<h1 class="title page-title">Welcome back, {{username}}</h1>

</template>

<style>

</style>
