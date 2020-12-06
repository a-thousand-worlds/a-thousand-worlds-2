<script>

export default {
  name: 'LogInPage',
  data() {
    return {
      active: 'login',
      engagementCategories: [
        { id: 0, text: 'CATEGORY' },
        { id: 1, text: 'CATEGORY' },
        { id: 2, text: 'CATEGORY' },
        { id: 3, text: 'CATEGORY' },
        { id: 4, text: 'CATEGORY' },
        { id: 5, text: 'CATEGORY' },
        { id: 6, text: 'CATEGORY' },
        { id: 7, text: 'CATEGORY' },
      ],
      email: '',
      password: '',
      signupData: {
        organization: '',
        otherEngagementCategory: '',
        selectedEngagementCategories: {},
      },
      loading: false,
      error: '',
    }
  },
  computed: {
    isLogin() {
      return this.active === 'login'
    },
    isSignup() {
      return this.active === 'signup'
    },
  },
  methods: {
    async login() {
      this.loading = true
      await this.$store.dispatch('userLogin', {
        email: this.email,
        password: this.password
      })
        .then(() => {
          this.loading = false
          this.error = ''
        })
        .catch(err => {
          console.error('login error', err)
          this.error = err.message
          this.loading = false
        })
    },
    async signup() {

      if (!this.validate()) return

      this.loading = true
      await this.$store.dispatch('userRegister', {
        email: this.email,
        password: this.password,
        ...this.signupData,
      })
        .then(() => {
          this.loading = false
          this.error = ''
        })
        .catch(err => {
          console.error('register error', err)
          this.error = err.message
          this.loading = false
        })
    },
    setActive(active) {
      this.active = active
    },
    validate() {
      if (!this.email.length) {
        this.error = 'Email required'
      }
      else if (!this.password.length) {
        this.error = 'Password required'
      }
      return !this.error
    },
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

  <div class="mx-6">

    <!-- Cannot use are-small and is-rounded until #3208 is merged. See https://github.com/jgthms/bulma/pull/3208. -->
    <div class="buttons is-centered has-addons">
      <button :class="['button', 'is-small', 'is-rounded', ...[isSignup ? ['is-selected', 'is-dark'] : null]]" @click="setActive('signup')">Sign Up</button>
      <button :class="['button', 'is-small', 'is-rounded', ...[isLogin ? ['is-selected', 'is-dark'] : null]]" @click="setActive('login')">Log In</button>
    </div>

    <div class="is-flex is-justify-content-center">
      <!-- is-half-desktop is-three-quarters-touch is-offset-one-quarter-desktop -->
      <form class="is-flex-grow-1" style="max-width: 480px;" @submit.prevent="login">

        <h1 class="title page-title divider-bottom">{{ isSignup ? 'Sign up for an account' : isLogin ? 'Log In' : null }}</h1>

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

        <div class="field" v-if="isSignup">
          <label class="label is-uppercase">How do you engage with books?</label>
          <div style="column-count: 2;">
            <div v-for="category of engagementCategories" :key="category.id" class="control columns-2">
              <input :disabled="loading" :id="category.id" :name="category.id" type="checkbox" class="checkbox mr-3 mb-3" v-model="signupData.selectedEngagementCategories[category.id]">
              <label class="label is-inline" style="word-wrap: nobreak;" :for="category.id">
                {{category.text}}
              </label>
            </div>
            <div>
              <input :disabled="loading" type="checkbox" class="checkbox mr-3 mb-3" v-model="signupData.selectedEngagementCategories.other">
              <label class="label is-inline mr-2">OTHER</label>
              <input :disabled="loading" class="input is-inline" style="max-width: 200px;" type="text" v-model="signupData.otherEngagementCategory">
            </div>
          </div>

        </div>

        <div class="field divider-30" v-if="isSignup">
          <label class="label is-uppercase">Are you affiliated with any organization(s)?</label>
          <input :disabled="loading" class="input" type="text" v-model="signupData.organization">
        </div>

        <div v-if="error !== ''" class="field">
          <small>{{error}}</small>
        </div>

        <div class="field my-4">
          <input :disabled="loading" type="submit" class="button is-primary is-rounded is-fullwidth" :class="{'is-loading':loading}" :value="isLogin ? 'LOG IN' : isSignup ? 'CREATE ACCOUNT' : null"/>
        </div>

        <p class="has-text-centered" v-if="isLogin">
          <router-link :to="{name:'PasswordReset'}">FORGOT PASSWORD?</router-link>
        </p>

      </form>
    </div>
  </div>

</template>

<style scoped lang="scss">

.divider-bottom {
  padding-bottom: 15px;
  margin-bottom: 38px;
  border-bottom: solid 1px #ddd;
}

.divider-30 {
  padding-bottom: 30px;
  margin-bottom: 30px;
  border-bottom: solid 1px #ddd;
}

.field:not(:last-child) {
  margin-bottom: 30px;
}

</style>
