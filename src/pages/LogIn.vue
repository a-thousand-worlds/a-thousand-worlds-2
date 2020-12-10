<script>
import _ from 'lodash'

export default {
  name: 'LogInPage',
  data() {
    return {
      // the active tab (login or signup)
      active: window.location.pathname === '/login' ? 'login'
      : window.location.pathname === '/signup' ? 'signup'
      : window.location.pathname === '/profile' ? 'profile'
      : null,
      email: this.$store.state.user?.profile?.email || '',
      name: this.$store.state.user?.profile?.name || '',
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
      disableAfterSave: false,
      error: null,
      loading: false,
      message: '',
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
          console.error(err)
          this.error = {
            // reword wrong-password error from "The password is invalid or the user does not have a password."
            message: err.code === 'auth/wrong-password' ? 'Wrong email or password'
            : err.code === 'auth/user-not-found' ? 'Email not registered'
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
      if (this.active === 'signup') {
        await this.signup()
      }
      else if (this.active === 'login') {
        await this.login()
      }
      else if (this.active === 'profile') {
        await this.saveProfile()
      }
    },

    async login() {

      if (!this.validate()) return

      return this.handleResponse(this.$store.dispatch('userLogin', {
        email: this.email,
        password: this.password
      })
        .then(() => {
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push({ name: 'Dashboard' })
        })
      )
    },

    async signup() {

      if (!this.validate()) return

      return this.handleResponse(this.$store.dispatch('userRegister', {
        email: this.email,
        name: this.name,
        password: this.password,
        ...this.signupData,
      })
        .then(() => {
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push({ name: 'Dashboard' })
        })
      )
    },

    async saveProfile() {

      if (!this.validate()) return

      clearTimeout(this.messageTimeout)
      clearTimeout(this.disableAfterSave)
      this.disableAfterSave = true

      await this.handleResponse(this.$store.dispatch('saveProfile', {
        name: this.name,
        ...this.signupData,
      })
        .then(() => {
          this.message = 'Profile saved'
          this.messageTimeout = setTimeout(() => {
            this.message = ''
          }, 5000)
        })
      )

      this.disableAfterSaveTimeout = setTimeout(() => {
        this.disableAfterSave = false
      }, 1000)
    },

    setActive(active) {
      this.active = active

      // eslint-disable-next-line fp/no-mutating-methods
      this.$router.push({
        name: active === 'signup' ? 'Signup'
        : active === 'login' ? 'LogIn'
        : active === 'profile' ? 'Profile'
        : null
      })
    },

    /** Checks all fields for errors and updates this.error. */
    validate() {

      this.error = null

      if ((this.active === 'signup' || this.active === 'profile') && !this.name.length) {
        this.error = {
          message: 'Please check required fields',
          fields: { ...this.error?.fields, name: true },
        }
      }

      if ((this.active === 'signup' || this.active === 'login') && !this.email.length) {
        this.error = {
          message: 'Please check required fields',
          fields: { ...this.error?.fields, email: true },
        }
      }

      if ((this.active === 'signup' || this.active === 'login') && !this.password.length) {
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
        if (this.$iam('creator') || this.$iam('contributor') || this.$iam('admin') || this.$iam('superadmin')) {
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push({ name: 'Dashboard' })
        }
        else {
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push({ name: 'Home' })
        }
      }

      this.name = this.$store.state.user?.profile?.name
    }
  }
}

</script>

<template>

  <div class="mx-6">

    <div class="is-flex is-justify-content-center">
      <form class="is-flex-grow-1" style="max-width: 480px;" @submit.prevent="submit">

        <!-- Cannot use are-small and is-rounded until #3208 is merged. See https://github.com/jgthms/bulma/pull/3208. -->
        <div class="buttons is-centered has-addons" v-if="active === 'login' || active === 'signup'">
          <button :class="['button', 'is-small', 'is-rounded', ...[active === 'signup' ? ['is-selected', 'is-dark'] : null]]" style="width: 50%; max-width: 240px;" @click.prevent="setActive('signup')">Sign Up</button>
          <button :class="['button', 'is-small', 'is-rounded', ...[active === 'login' ? ['is-selected', 'is-dark'] : null]]" style="width: 50%; max-width: 240px;" @click.prevent="setActive('login')">Log In</button>
        </div>

        <h1 class="title page-title divider-bottom">{{
          active === 'signup' ? 'Sign up for an account'
          : active === 'login' ? 'Log In'
          : active === 'profile' ? 'Profile'
          : null
        }}</h1>

        <div class="field" v-if="active === 'signup' || active === 'profile'">
          <label :class="['label', { error: hasError('name') }]">NAME</label>
          <div class="control">
            <input :disabled="loading" type="text" class="input" v-model="name" @input="revalidate">
          </div>
        </div>

        <div class="field" v-if="active ==='login' || active === 'signup'">
          <label :class="['label', { error: hasError('email') }]">EMAIL</label>
          <div class="control">
            <input :disabled="loading" type="email" class="input" v-model="email" @input="revalidate">
          </div>
        </div>

        <div class="field" v-if="active === 'login' || active === 'signup'">
          <label :class="['label', { error: hasError('password') }]">PASSWORD</label>
          <div class="control">
            <input :disabled="loading" type="password" class="input" v-model="password" @input="revalidate">
          </div>
        </div>

        <div class="field" v-if="active === 'signup' || active === 'profile'">
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
              <input :disabled="loading" class="input" style="max-width: 200px;" type="text" v-model="signupData.otherEngagementCategory">
            </div>
          </div>

        </div>

        <div class="field divider-30" v-if="active === 'signup' || active === 'profile'">
          <label class="label is-uppercase">Are you affiliated with any organization(s)?</label>
          <input :disabled="loading" class="input" type="text" v-model="signupData.organization">
        </div>

        <div class="field my-4">
          <input :disabled="loading || hasFieldErrors || disableAfterSave" type="submit" class="button is-primary is-rounded is-fullwidth is-uppercase" :class="{'is-loading':loading}" :value="active === 'login' ? 'Log In' : active === 'signup' ? 'Create Account' : active === 'profile' ? 'Save' : null"/>
        </div>

        <div v-if="message" class="field">
          <p class="message has-text-centered is-uppercase">{{message}}</p>
        </div>

        <div v-if="error" class="field">
          <p class="error has-text-centered is-uppercase">{{error.message}}</p>
        </div>

        <p class="has-text-centered" v-if="active === 'login'">
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
