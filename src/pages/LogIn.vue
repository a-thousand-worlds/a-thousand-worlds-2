<script>

export default {
  name: 'LogInPage',
  data() {
    return {
      loading: false,
      error: '',
      email: '',
      password: ''
    }
  },
  methods: {
    login() {
      this.loading = true
      this.$store.dispatch('userLogin', { email: this.email, password: this.password })
        .then(() => {
          this.loading = false
          this.error = ''
        })
        .catch(err => {
          console.log('login error', err)
          this.error = err.message
          this.loading = false
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

<h1 class="title page-title">LogIn</h1>
<div class="columns">
  <div class="column">
    <div class="baner m-5 p-5">
      <h2>Access your saved books</h2>
      <h2>Modify your submission</h2>
      <h2>Update your book or curated list</h2>
    </div>
  </div>
  <form class="column" @submit.prevent="login()">
    <div class="field">
      <label class="label">EMAIL</label>
      <div class="control">
        <input :disabled="loading" type="email" class="input" v-model="email">
      </div>
    </div>
    <div class="field">
      <label class="label">PASSWORD</label>
      <div class="control">
        <input :disabled="loading" type="password" class="input" v-model="password">
      </div>
    </div>
    <div v-if="error!==''" class="field">
      <small>{{error}}</small>
    </div>
    <div class="field">
      <input :disabled="loadin" type="submit" class="button is-primary w-100" :class="{'is-loading':loading}" value="LOG IN"/>
    </div>
    <div>
      <p> Forgot password? <router-link :to="{name:'PasswordReset'}">Reset here</router-link></p>
      <p> Don't have account? <router-link :to="{name:'Register'}">Register here</router-link></p>
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
