<script>

export default {
  name: 'PasswordResetPage',
  data() {
    return {
      email: ''
    }
  },
  methods: {
    pReset() {
      if (!this.email || !this.email.length) {
        return
      }
      this.$store.dispatch('passwordReset', this.email)
        .then(() => {})
        .catch(err => {
          console.log('reset error', err)
        })
    }
  },
  watch: {
    '$store.state.user'(next, prev) {
      if (!prev && !!next) {
        // eslint-disable-next-line fp/no-mutating-methods
        this.$router.push({ name: 'Profile' })
      }
    }
  }
}

</script>

<template>

<h1 class="title page-title">Password Reset</h1>
<div class="columns">
  <form class="column is-half is-offset-one-quarter" @submit.prevent="pReset()">
    <div class="field">
      <label class="label">EMAIL</label>
      <div class="control">
        <input type="email" class="input" v-model="email">
      </div>
    </div>
    <div class="field">
      <input type="submit" class="button is-primary w-100" value="RESET"/>
    </div>
    <div>
      <p> Have account? <router-link :to="{name:'LogIn'}">Log In</router-link></p>
      <p> Don't have? <router-link :to="{name:'Register'}">Register here</router-link></p>
    </div>
  </form>
</div>

</template>

<style>

</style>
