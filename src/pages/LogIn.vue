<script>
import _ from 'lodash'

export default {
  name: 'LogInPage',
  data() {
    return {
      // the active tab (login or signup)
      active: window.location.pathname === '/login' ? 'login'
      : window.location.pathname === '/signup' ? 'signup'
      : null,
      email: '',
      // all options for enagement checkboxes
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
      error: null,
      loading: false,
      password: '',
      signupData: {
        organization: '',
        otherEngagementCategory: '',
        selectedEngagementCategories: {},
      },
      // only show errors after a submit has been attempted
      submitAttempt: false,

    }
  },

  computed: {
    isLogin() {
      return this.active === 'login'
    },
    isSignup() {
      return this.active === 'signup'
    },
    hasFieldErrors() {
      return Object.keys(this.error?.fields || {}).length > 0
    }
  },

  methods: {

    /** Shows or clears an error for the given service response. */
    handleResponse(response) {
      this.loading = true
      return response
        .then(() => {
          this.loading = false
          this.error = null
        })
        .catch(err => {
          console.error('err', err)
          this.error = {
            // reword wrong-password error from "The password is invalid or the user does not have a password."
            message: err.code === 'auth/wrong-password'
              ? 'Wrong email or password'
              : err.message
          }
          this.loading = false
        })
    },

    /** Returns 'error' if a field is in error. */
    hasError(field) {
      return this.error?.fields?.[field]
    },

    async submit() {
      if (this.isSignup) {
        await this.signup()
      }
      else if (this.isLogin) {
        await this.login()
      }
    },

    async login() {

      if (!this.validate()) return

      return this.handleResponse(this.$store.dispatch('userLogin', {
        email: this.email,
        password: this.password
      }))
        .then(() => {
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push({ name: 'Profile' })
        })
    },

    async signup() {

      if (!this.validate()) return

      return this.handleResponse(this.$store.dispatch('userRegister', {
        email: this.email,
        password: this.password,
        ...this.signupData,
      }))
        .then(() => {
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push({ name: 'Profile' })
        })
    },

    setActive(active) {
      this.active = active

      // eslint-disable-next-line fp/no-mutating-methods
      this.$router.push({
        name: active === 'signup' ? 'Signup'
        : active === 'login' ? 'LogIn'
        : null
      })
    },

    /** Checks all fields for errors and updates this.error. */
    validate() {

      this.error = null

      if (!this.email.length) {
        this.error = {
          message: 'Please check required fields',
          fields: { ...this.error?.fields, email: true },
        }
      }

      if (!this.password.length) {
        this.error = {
          message: 'Please check required fields',
          fields: { ...this.error?.fields, password: true },
        }
      }

      return !this.error
    },

    /** Debounced validation, only if error */
    revalidate: _.debounce(function() {
      return !this.error || this.validate()
    }, 50),

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

    <div class="is-flex is-justify-content-center">
      <form class="is-flex-grow-1" style="max-width: 480px;" @submit.prevent="submit">

        <!-- Cannot use are-small and is-rounded until #3208 is merged. See https://github.com/jgthms/bulma/pull/3208. -->
        <div class="buttons is-centered has-addons">
          <button :class="['button', 'is-small', 'is-rounded', ...[isSignup ? ['is-selected', 'is-dark'] : null]]" style="width: 50%; max-width: 240px;" @click.prevent="setActive('signup')">Sign Up</button>
          <button :class="['button', 'is-small', 'is-rounded', ...[isLogin ? ['is-selected', 'is-dark'] : null]]" style="width: 50%; max-width: 240px;" @click.prevent="setActive('login')">Log In</button>
        </div>

        <h1 class="title page-title divider-bottom">{{ isSignup ? 'Sign up for an account' : isLogin ? 'Log In' : null }}</h1>

        <div class="field">
          <label :class="['label', { error: hasError('email') }]">EMAIL</label>
          <div class="control">
            <input :disabled="loading" type="email" class="input" v-model="email" @input="revalidate">
          </div>
        </div>

        <div class="field">
          <label :class="['label', { error: hasError('password') }]">PASSWORD</label>
          <div class="control">
            <input :disabled="loading" type="password" class="input" v-model="password" @input="revalidate">
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

        <div class="field my-4">
          <input :disabled="loading || hasFieldErrors" type="submit" class="button is-primary is-rounded is-fullwidth" :class="{'is-loading':loading}" :value="isLogin ? 'LOG IN' : isSignup ? 'CREATE ACCOUNT' : null"/>
        </div>

        <div v-if="error" class="field">
          <p class="error has-text-centered is-uppercase">{{error.message}}</p>
        </div>

        <p class="has-text-centered" v-if="isLogin">
          <router-link :to="{name:'PasswordReset'}">FORGOT PASSWORD?</router-link>
        </p>

      </form>
    </div>
  </div>

</template>

<style scoped lang="scss">

.field:not(:last-child) {
  margin-bottom: 30px;
}

</style>
