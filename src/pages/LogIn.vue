<script>
import _ from 'lodash'
import Loader from '@/components/Loader'

export default {
  name: 'LogInPage',
  components: {
    Loader,
  },
  data() {
    return {
      // the active tab (login or signup)
      active: this.getActiveFromUrl(),
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
      disableResetPassword: false,
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
    code() {
      return this.$route.query.code
    },
    hasFieldErrors() {
      return Object.keys(this.error?.fields || {}).length > 0
    },
    invite() {
      return this.$store.getters['invites/get'](this.code)
    },
    title() {
      return this.active === 'signup' ?
        this.invite?.role ? `You have been invited to join as a ${this.invite.role}!` : 'Sign up for an account'
        : this.active === 'login' ? 'Log In'
        : this.active === 'profile' ? 'Profile'
        : null
    }
  },

  watch: {
    // populate name and email fields with invite data
    invite(next, prev) {
      if (next?.email && !this.email) {
        this.email = next.email
      }
      if (next?.firstName && !this.name) {
        this.name = `${next.firstName} ${next.lastName}`.trim()
      }
    },
    '$route'(next) {
      this.active = this.getActiveFromUrl()
    },
    '$store.state.user.user'(next, prev) {
      if (!prev && !!next) {
        if (this.$can('viewDashboard')) {
          this.$router.push({ name: 'Dashboard' })
        }
        else {
          this.$router.push({ name: 'Home' })
        }
      }

      this.name = this.$store.state.user?.profile?.name
    }
  },

  methods: {

    async resetPassword() {
      this.disableResetPassword = true
      try {
        await this.$store.dispatch('user/passwordReset', this.email)
        this.$store.dispatch('alert', {
          text: 'Check your email to reset your password',
          timer: 10000,
        })
      }
      catch (e) {
        this.disableResetPassword = false
        this.$store.dispatch('alert', {
          text: 'Error resetting password',
          type: 'error'
        })
      }
    },

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

    getActiveFromUrl() {
      return window.location.pathname === '/login' ? 'login'
        : window.location.pathname === '/signup' ? 'signup'
        : window.location.pathname === '/profile' ? 'profile'
        : null
    },

    async onPasswordKeyEnter() {
      if (this.active === 'login') {
        await this.login()
      }
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

      return this.handleResponse(this.$store.dispatch('user/login', {
        email: this.email,
        password: this.password
      })
        .then(() => {
          this.$router.push({ name: 'Dashboard' })
        })
      )
    },

    async signup() {

      if (!this.validate()) return

      return this.handleResponse(this.$store.dispatch('user/signup', {
        code: this.code,
        email: this.email,
        name: this.name,
        password: this.password,
        ...this.signupData,
      })
        .then(() => {
          this.$router.push({ name: 'Dashboard' })
        })
      )
    },

    async saveProfile() {

      if (!this.validate()) return

      clearTimeout(this.messageTimeout)
      clearTimeout(this.disableAfterSaveTimeout)
      this.disableAfterSave = true

      this.loading = true

      await this.$store.dispatch('user/updateEmail', this.email)
        .catch(err => {
          console.error(err)
          this.error = {
            // reword requires-recent-login error from "This operation is sensitive and requires recent authentication. Log in again before retrying this request."
            fields: { ...this.error?.fields, email: true },
            message: err.code === 'auth/requires-recent-login' ? 'Changing your email requires a recent login. Please log in again before attempting this change.'
            : err.message
          }
          this.loading = false
        })

      if (!this.error) {
        await this.handleResponse(this.$store.dispatch('user/saveProfile', {
          name: this.name,
          email: this.email,
          ...this.signupData,
        })
          .then(() => {
            if (!this.error) {
              this.$store.dispatch('alert', {
                text: 'Profile saved',
                type: 'success'
              })
            }
          })
        )
      }

      this.disableAfterSaveTimeout = setTimeout(() => {
        this.disableAfterSave = false
      }, 1000)
    },

    setActive(active) {
      this.active = active
      this.error = null

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

      if ((this.active === 'signup' || this.active === 'login' || this.active === 'profile') && !this.email.length) {
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
}

</script>

<template>

  <div class="mx-6">

    <div v-if="active === 'profile'" class="mb-5">
      <router-link :to="{ name: 'Dashboard' }" class="is-uppercase is-primary">&lt; Back to Dashboard</router-link>
    </div>

    <div v-if="(code && !invite) || (invite?.used)" class="is-flex is-justify-content-center mt-20">
      <div v-if="!$store.state.invites.loaded" class="my-50 has-text-centered">
        <Loader />
      </div>
      <div v-else class="my-50 has-text-centered">
        <h2>{{ invite?.used ? 'This invitation code has already been used.' : 'Invalid invitation code' }}</h2>
        <router-link :to="{ name: 'LogIn' }"><button class="button is-primary is-rounded is-uppercase mt-20">Log In</button></router-link>
      </div>
    </div>

    <div v-else class="is-flex is-justify-content-center">
      <form class="is-flex-grow-1" style="max-width: 480px;" @submit.prevent="submit">

        <!-- Cannot use are-small and is-rounded until #3208 is merged. See https://github.com/jgthms/bulma/pull/3208. -->
        <div v-if="active === 'login' || (active === 'signup' && !code)" class="buttons is-centered has-addons">
          <button :class="['button', 'is-small', 'is-rounded', ...[active === 'signup' ? ['is-selected'] : null]]" style="width: 50%; max-width: 240px;" @click.prevent="setActive('signup')">Sign Up</button>
          <button :class="['button', 'is-small', 'is-rounded', ...[active === 'login' ? ['is-selected'] : null]]" style="width: 50%; max-width: 240px;" @click.prevent="setActive('login')">Log In</button>
        </div>

        <div>
          <h1 v-if="!invite || invite.role" class="title page-title divider-bottom">{{ title }}</h1>

          <div v-if="active === 'signup' || active === 'profile'" class="field">
            <label :class="['label', { error: hasError('name') }]">NAME</label>
            <div class="control">
              <input v-model="name" :disabled="loading" type="text" class="input" :class="{ 'is-danger': hasError('name') }" @input="revalidate">
            </div>
          </div>

          <div v-if="active ==='login' || active === 'signup' || active === 'profile'" class="field">
            <label :class="['label', { error: hasError('email') }]">EMAIL</label>
            <div class="control">
              <input v-model="email" :disabled="loading" type="email" class="input" :class="{ 'is-danger': hasError('email') }" @input="revalidate">
            </div>
          </div>

          <div v-if="active === 'login' || active === 'signup'" class="field">
            <label :class="['label', { error: hasError('password') }]">PASSWORD</label>
            <div class="control">
              <input v-model="password" :disabled="loading" type="password" class="input" :class="{ 'is-danger': hasError('password') }" @keypress.enter.prevent="onPasswordKeyEnter" @input="revalidate">
            </div>
          </div>

          <div v-if="active === 'signup' || active === 'profile'" class="field">
            <label class="label is-uppercase">How do you engage with books?</label>
            <div style="column-count: 2;">
              <div v-for="category of engagementCategories" :key="category.id" class="control columns-2">
                <input :id="category.id" v-model="signupData.selectedEngagementCategories[category.id]" :disabled="loading" :name="category.id" type="checkbox" class="checkbox mr-3 mb-3">
                <label class="label is-inline" style="word-wrap: nobreak;" :for="category.id">
                  {{ category.text }}
                </label>
              </div>
              <div>
                <input v-model="signupData.selectedEngagementCategories.other" :disabled="loading" type="checkbox" class="checkbox mr-3 mb-3">
                <label class="label is-inline mr-2">OTHER</label>
                <input v-model="signupData.otherEngagementCategory" :disabled="loading" class="input" style="max-width: 200px;" type="text">
              </div>
            </div>

          </div>

          <div v-if="active === 'signup' || active === 'profile'" class="field divider-30">
            <label class="label is-uppercase">Are you affiliated with any organization(s)?</label>
            <input v-model="signupData.organization" :disabled="loading" class="input" type="text">
          </div>

          <div class="field my-4">
            <input :disabled="loading || hasFieldErrors || disableAfterSave" type="submit" class="button is-primary is-rounded is-fullwidth is-uppercase" :class="{'is-loading':loading}" :value="active === 'login' ? 'Log In' : active === 'signup' ? 'Create Account' : active === 'profile' ? 'Save' : null">
          </div>

          <div v-if="error" class="field">
            <p class="error has-text-centered is-uppercase">{{ error.message }}</p>
          </div>

          <p v-if="active === 'login'" class="has-text-centered">
            <router-link :to="{name:'PasswordReset'}">FORGOT PASSWORD?</router-link>
          </p>

          <p v-if="active === 'profile'" class="has-text-centered">
            <button class="button is-flat" :disabled="disableResetPassword" @click.prevent="resetPassword">Reset Password</button>
          </p>

        </div>

      </form>
    </div>
  </div>

</template>

<style scoped lang="scss">

.field:not(:last-child) {
  margin-bottom: 30px;
}

</style>
