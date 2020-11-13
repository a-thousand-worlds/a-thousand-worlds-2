<script>

export default {
  name: 'RegisterPage',
  data() {
    return {
      email: '',
      password: '',
      password2: ''
    }
  },
  methods: {
    async doRegister() {
      if (!this.email.length || !this.password.length || this.password !== this.password2) {
        return
      }
      const res = await this.$store.dispatch('userRegister', { email: this.email, password: this.password })
      console.log('user register res', res)
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

<h1 class="title page-title">Register</h1>
<div class="columns">
  <div class="column">
    <div class="baner m-5 p-5">
      <h2>Access your saved books</h2>
      <h2>Modify your submission</h2>
      <h2>Update your book or curated list</h2>
    </div>
  </div>
  <form class="column" @submit.prevent="doRegister()">
    <div class="field">
      <label class="label">EMAIL</label>
      <div class="control">
        <input type="email" class="input" v-model="email">
      </div>
    </div>
    <div class="field">
      <label class="label">PASSWORD</label>
      <div class="control">
        <input type="password" class="input" v-model="password">
      </div>
    </div>
    <div class="field">
      <label class="label">PASSWORD CONFIRM</label>
      <div class="control">
        <input type="password" class="input" v-model="password2">
      </div>
    </div>
    <div class="field">
      <input type="submit" class="button is-primary w-100" value="REGISTER"/>
    </div>
    <div>
      <p> Have account? <router-link :to="{name:'LogIn'}">Log In</router-link></p>
      <p> Forgot password? <router-link :to="{name:'PasswordReset'}">Reset here</router-link></p>
    </div>
  </form>
</div>

</template>

<style scoped lang="scss">

div.baner {
  h2 {
    font-size: 150%;
  }
}

</style>
