<script>

export default {
  name: 'PasswordResetPage',
  data() {
    return {
      email: ''
    }
  },
  watch: {
    '$store.state.user.user'(next, prev) {
      if (!prev && !!next) {
        // eslint-disable-next-line fp/no-mutating-methods
        this.$router.push({ name: 'Dashboard' })
      }
    }
  },
  methods: {
    pReset() {
      if (!this.email || !this.email.length) {
        return
      }
      this.$store.dispatch('user/passwordReset', this.email)
        .then(() => {})
        .catch(err => {
          console.error('passwordReset error', err)
        })
    }
  }
}

</script>

<template>

  <div class="is-flex is-justify-content-center">
    <form class="is-flex-grow-1" style="max-width: 480px;" @submit.prevent="pReset()">

      <h1 class="title page-title divider-bottom">Password Reset</h1>

      <div class="field">
        <label class="label">EMAIL</label>
        <div class="control">
          <input v-model="email" type="email" class="input">
        </div>
      </div>

      <div class="field">
        <input type="submit" class="button is-primary w-100" value="RESET">
      </div>

      <div class="has-text-centered">
        <p><router-link :to="{name:'LogIn'}">LOG IN</router-link></p>
        <p><router-link :to="{name:'Signup'}">SIGN UP</router-link></p>
      </div>

    </form>
  </div>

</template>

<style>

</style>
