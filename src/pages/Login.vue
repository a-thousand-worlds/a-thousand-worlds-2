<script>
import validator from '@/mixins/validator'
import Loader from '@/components/Loader'

export default {
  name: 'LoginPage',
  components: {
    Loader,
  },

  mixins: [
    validator(function() {
      return [
        // email
        !this.email.length && {
          name: 'email',
          message: 'Email is required',
        },
        // name
        (this.isSignup || this.isAccount) && !this.name.length && {
          name: 'name',
          message: 'Name is required',
        },
        // password
        (this.isSignup || this.isLogin) && !this.password.length && {
          name: 'password',
          message: 'Password is required',
        },
      ].filter(x => x)
    })
  ],

  data() {
    const profile = this.$store.state.user.user?.profile
    return {
      // the active tab (login or signup)
      active: this.getActiveFromUrl(),
      email: profile?.email || '',
      name: profile?.name || '',
      disableAfterSave: false,
      disableResetPassword: false,
      loading: false,
      password: '',
      // only show errors after a submit has been attempted
      submitAttempt: false,
    }
  },

  computed: {

    // boolean role and page aliases
    isAccount() {
      return this.active === 'account'
    },
    isLogin() {
      return this.active === 'login'
    },
    isSignup() {
      return this.active === 'signup'
    },

    // other computed properties
    code() {
      return this.$route.query.code
    },
    invite() {
      return this.code ? this.$store.getters['invites/get'](this.code) : null
    },
    title() {
      return this.isSignup ?
        this.invite?.role ? `You have been invited to join as a ${this.invite.role}!` : 'Sign up for an account'
        : this.isLogin ? 'Log In'
        : this.isAccount ? 'Your Account'
        : null
    },
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

      // redirect regular users to Home and authorized users to Dashboard
      // do not redirect on invite, which needs to redirect when roles are set
      if (!this.invite && next) {
        this.$router.push({
          name: this.$can('viewDashboard') ? 'Dashboard' : 'Home'
        })
      }

      this.email = next?.profile?.email || this.email
      this.name = next?.profile?.name || this.name
    },
    '$store.state.user.user.roles'(next, prev) {
      // redirect invited users to Dashboard
      if (this.invite && next && Object.keys(next || {}).length) {
        this.$router.push({
          name: 'Dashboard'
        })
      }
    }
  },

  methods: {

    async resetPassword() {
      this.disableResetPassword = true
      try {
        await this.$store.dispatch('user/passwordReset', this.email)
        this.$store.dispatch('ui/popup', {
          text: 'Check your email to reset your password',
          timer: 10000,
        })
      }
      catch (e) {
        this.disableResetPassword = false
        this.$store.dispatch('ui/popup', {
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
          this.disableAfterSave = false
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
          this.disableSend = false
        })
    },

    getActiveFromUrl() {
      return window.location.pathname === '/login' ? 'login'
        : window.location.pathname === '/signup' ? 'signup'
        : window.location.pathname === '/account' ? 'account'
        : null
    },

    async onEnter() {
      if (this.isLogin) {
        await this.login()
      }
    },

    async submit() {
      if (this.isSignup) {
        await this.signup()
      }
      else if (this.isLogin) {
        await this.login()
      }
      else if (this.isAccount) {
        await this.saveProfile()
      }
    },

    async login() {

      if (!this.validate()) return

      return this.handleResponse(this.$store.dispatch('user/login', {
        email: this.email,
        password: this.password
      }))
    },

    async signup() {

      if (!this.validate()) return

      return this.handleResponse(this.$store.dispatch('user/signup', {
        code: this.code,
        email: this.email,
        name: this.name,
        password: this.password,
      }))
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
          this.disableSend = false
        })

      if (!this.error) {
        await this.handleResponse(this.$store.dispatch('user/updateProfile', {
          name: this.name,
          email: this.email,
        })
          .then(() => {
            if (!this.error) {
              this.$store.dispatch('ui/popup', {
                text: 'Account updated',
                type: 'success'
              })
            }
          })
        )
      }
    },

    setActive(active) {
      this.active = active
      this.error = null

      this.$router.push({
        name: this.isSignup ? 'Signup'
        : this.isLogin ? 'Login'
        : this.isAccount ? 'Account'
        : null
      })
    },

  },
}

</script>

<template>

  <div class="mx-6">

    <div v-if="isAccount" class="mb-5">
      <a @click.prevent="$router.back" class="is-uppercase is-primary">&lt; Back</a>
    </div>

    <div v-if="(code && !invite) || (invite?.used)" class="is-flex is-justify-content-center mt-20">
      <div v-if="!$store.state.invites.loaded" class="my-50 has-text-centered">
        <Loader />
      </div>
      <div v-else class="my-50 has-text-centered">
        <h2>{{ invite?.used ? 'This invitation code has already been used.' : 'Invalid invitation code' }}</h2>
        <router-link :to="{ name: 'Login' }"><button class="button is-primary is-rounded is-uppercase mt-20">Log In</button></router-link>
      </div>
    </div>

    <div v-else class="is-flex is-justify-content-center">

      <form class="is-flex-grow-1" style="max-width: 490px;" @submit.prevent="submit">

        <!-- Cannot use are-small and is-rounded until #3208 is merged. See https://github.com/jgthms/bulma/pull/3208. -->
        <div v-if="isLogin || (isSignup && !code)" class="buttons is-centered has-addons">
          <button :class="['button', 'is-small', 'is-rounded', ...[isSignup ? ['is-selected'] : null]]" style="width: 50%; max-width: 240px;" @click.prevent="setActive('signup')">Sign Up</button>
          <button :class="['button', 'is-small', 'is-rounded', ...[isLogin ? ['is-selected'] : null]]" style="width: 50%; max-width: 240px;" @click.prevent="setActive('login')">Log In</button>
        </div>

        <div>
          <h1 class="title page-title divider-bottom">{{ title }}</h1>

          <div class="is-flex field">

            <!-- name -->
            <div class="is-flex-grow-1 is-flex is-justify-content-center is-flex-direction-column">
              <div v-if="isSignup || isAccount" class="field">
                <label :class="['label', { error: hasError('name') }]">NAME<sup class="required">*</sup></label>
                <div class="control">
                  <input v-model="name" :disabled="loading" type="text" class="input" :class="{ 'is-danger': hasError('name') }" @input="revalidate">
                </div>
              </div>

              <!-- email -->
              <div v-if="isLogin || isSignup || isAccount" class="field">
                <label :class="['label', { error: hasError('email') }]">EMAIL<sup class="required">*</sup></label>
                <div class="control">
                  <span v-tippy="invite ? { content: `You have to use this email to sign up as a ${invite.role}, but you can change it after logging in.` } : null">
                    <input v-model="email" @keypress.enter.prevent="onEnter" :disabled="invite" type="email" class="input" :class="{ 'is-danger': hasError('email') }" @input="revalidate">
                  </span>
                </div>
              </div>

              <!-- password -->
              <div v-if="isLogin || isSignup" class="field">
                <label :class="['label', { error: hasError('password') }]">PASSWORD<sup class="required">*</sup></label>
                <div class="control">
                  <input v-model="password" :disabled="loading" type="password" class="input" :class="{ 'is-danger': hasError('password') }" @keypress.enter.prevent="onEnter" @input="revalidate">
                </div>
              </div>
            </div>

          </div>

          <div class="field my-4">
            <input :disabled="loading || disableAfterSave" type="submit" class="button is-primary is-rounded is-fullwidth is-uppercase" :class="{'is-loading':loading}" :value="isLogin ? 'Log In' : isSignup ? 'Create Account' : isAccount ? 'Save' : null">
          </div>

          <div v-if="errors.length" class="field">
            <p v-for="(error, i) of errors" :key="i" class="error has-text-centered is-uppercase">{{ error.message || 'Unknown error' }}</p>
          </div>

          <p v-if="isLogin" class="has-text-centered">
            <router-link :to="{name:'PasswordReset'}">FORGOT PASSWORD?</router-link>
          </p>

          <p v-if="isAccount" class="has-text-centered">
            <button class="button is-flat" :disabled="disableResetPassword" @click.prevent="resetPassword">Reset Password</button>
          </p>

        </div>

      </form>
    </div>
  </div>

</template>

<style scoped lang="scss">

.required {
  position: absolute;
}

.field:not(:last-child) {
  margin-bottom: 30px;
}

</style>
