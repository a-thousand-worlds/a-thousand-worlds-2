<script>
import _ from 'lodash'
import engagements from '@/store/constants/engagements'
import Loader from '@/components/Loader'
import PhotoUpload from '@/components/PhotoUpload'

export default {
  name: 'LoginPage',
  components: {
    Loader,
    PhotoUpload,
  },
  data() {
    const profile = this.$store.state.user.user?.profile
    return {
      // the active tab (login or signup)
      active: this.getActiveFromUrl(),
      email: profile?.email || '',
      name: profile?.name || '',
      photo: profile?.photo || null,
      engagements,
      disableAfterSave: false,
      disableResetPassword: false,
      error: null,
      loading: false,
      password: '',
      affiliations: {
        organization: '',
        organizationLink: '',
        otherEngagementCategory: '',
        website: null,
        selectedEngagementCategories: {},
        ...profile?.affiliations,
      },
      // only show errors after a submit has been attempted
      submitAttempt: false,

    }
  },

  computed: {

    // boolean role and page aliases
    isEditProfile() {
      return this.active === 'profile'
    },
    isLogin() {
      return this.active === 'login'
    },
    isSignup() {
      return this.active === 'signup'
    },
    isContributor() {
      return this.$store.state.user.user?.roles?.contributor || this.invite?.role === 'contributor'
    },
    isCreator() {
      return this.$store.state.user.user?.roles?.creator || this.invite?.role === 'creator'
    },

    // other computed properties
    code() {
      return this.$route.query.code
    },
    hasFieldErrors() {
      return Object.keys(this.error?.fields || {}).length > 0
    },
    invite() {
      return this.code ? this.$store.getters['invites/get'](this.code) : null
    },
    title() {
      return this.isSignup ?
        this.invite?.role ? `You have been invited to join as a ${this.invite.role}!` : 'Sign up for an account'
        : this.isLogin ? 'Log In'
        : this.isEditProfile ? this.$iam('creator')
          ? 'Your Account'
          : 'Edit Profile'
        : null
    },
    showOrgLink() {
      return this.isEditProfile && this.isContributor
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

      // redirect regular users to Home and authorized users to Dashboard
      // do not redirect on invite, which needs to redirect when roles are set
      if (!this.invite && next) {
        this.$router.push({
          name: this.$can('viewDashboard') ? 'Dashboard' : 'Home'
        })
      }

      this.affiliations = next?.profile?.affiliations || this.affiliations
      this.email = next?.profile?.email || this.email
      this.name = next?.profile?.name || this.name
      this.photo = next?.profile?.photo || this.photo
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
      else if (this.isEditProfile) {
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
        photo: this.photo,
        password: this.password,
        affiliations: this.affiliations,
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
        })

      if (!this.error) {
        await this.handleResponse(this.$store.dispatch('user/updateProfile', {
          name: this.name,
          email: this.email,
          photo: this.photo,
          affiliations: this.affiliations,
        })
          .then(() => {
            if (!this.error) {
              this.$store.dispatch('ui/popup', {
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
        name: this.isSignup ? 'Signup'
        : this.isLogin ? 'Login'
        : this.isEditProfile ? 'Profile'
        : null
      })
    },

    /** Checks all fields for errors and updates this.error. */
    validate() {

      this.error = null

      // email
      if (!this.email.length) {
        this.error = {
          message: 'Please check required fields',
          fields: { ...this.error?.fields, email: true },
        }
      }

      // name
      if ((this.isSignup || this.isEditProfile) && !this.name.length) {
        this.error = {
          message: 'Please check required fields',
          fields: { ...this.error?.fields, name: true },
        }
      }

      // password
      if ((this.isSignup || this.isLogin) && !this.password.length) {
        this.error = {
          message: 'Please check required fields',
          fields: { ...this.error?.fields, password: true },
        }
      }

      // contributor fields
      if (this.isContributor && this.isEditProfile) {

        // website
        if (!this.affiliations.website) {
          this.error = {
            message: 'Please check required fields',
            fields: { ...this.error?.fields, website: true },
          }
        }

        // engagements
        const hasSelectedEngagements = Object.values(this.affiliations.selectedEngagementCategories).some(x => x)
        if (!hasSelectedEngagements && !this.affiliations.otherEngagementCategory) {
          this.error = {
            message: 'Please check required fields',
            fields: { ...this.error?.fields, engagements: true },
          }
        }

        // organization name
        if (!this.affiliations.organization) {
          this.error = {
            message: 'Please check required fields',
            fields: { ...this.error?.fields, organizationName: true },
          }
        }

        // organization link
        if (!this.affiliations.organizationLink) {
          this.error = {
            message: 'Please check required fields',
            fields: { ...this.error?.fields, organizationLink: true },
          }
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

    <div v-if="isEditProfile" class="mb-5">
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

      <!-- TODO: width affects PhotoUpload aspect ratio -->
      <form class="is-flex-grow-1" style="max-width: 490px;" @submit.prevent="submit">

        <!-- Cannot use are-small and is-rounded until #3208 is merged. See https://github.com/jgthms/bulma/pull/3208. -->
        <div v-if="isLogin || (isSignup && !code)" class="buttons is-centered has-addons">
          <button :class="['button', 'is-small', 'is-rounded', ...[isSignup ? ['is-selected'] : null]]" style="width: 50%; max-width: 240px;" @click.prevent="setActive('signup')">Sign Up</button>
          <button :class="['button', 'is-small', 'is-rounded', ...[isLogin ? ['is-selected'] : null]]" style="width: 50%; max-width: 240px;" @click.prevent="setActive('login')">Log In</button>
        </div>

        <div>
          <h1 class="title page-title divider-bottom">{{ title }}</h1>

          <!-- name -->
          <div class="is-flex field">

            <PhotoUpload v-if="(isContributor || isCreator) && (isSignup || isEditProfile)" v-model="photo" class="mr-30 my-40" style="width: 40%" />

            <!-- vertically center name, email, and password since height is variable (password is not shown on Edit Profile page) -->
            <div class="is-flex-grow-1 is-flex is-justify-content-center is-flex-direction-column">
              <div v-if="isSignup || isEditProfile" class="field">
                <label :class="['label', { error: hasError('name') }]">NAME<sup class="required">*</sup></label>
                <div class="control">
                  <input v-model="name" :disabled="loading" type="text" class="input" :class="{ 'is-danger': hasError('name') }" @input="revalidate">
                </div>
              </div>

              <!-- email -->
              <div v-if="isLogin || isSignup || isEditProfile" class="field">
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

          <!-- website -->
          <div v-if="isContributor && isEditProfile" class="field">
            <label class="label is-uppercase" :class="{ error: hasError('website') }">Your website or social media URL<sup class="required">*</sup></label>
            <input v-model="affiliations.website" class="input" type="text">
          </div>

          <!-- engagement -->
          <div v-if="isContributor && isEditProfile" class="field">
            <label class="label is-uppercase" :class="{ error: hasError('engagements') }">How do you engage with books?<sup class="required">*</sup></label>
            <div class="sublabel tablet-columns-2">
              <div v-for="engagement of engagements" :key="engagement.id" class="control columns-2">
                <input :id="`engagement-${engagement.id}`" v-model="affiliations.selectedEngagementCategories[engagement.id]" :disabled="loading" :name="engagement.id" @input="revalidate" type="checkbox" :false-value="null" class="checkbox mr-2 mb-3">
                <label class="label is-inline" style="word-wrap: nobreak;" :for="`engagement-${engagement.id}`">
                  {{ engagement.text }}
                </label>
              </div>
              <div>
                <input v-model="affiliations.selectedEngagementCategories.other" id="engagement-other" :disabled="loading" type="checkbox" class="checkbox mr-2 mb-3">
                <label for="engagement-other" class="label is-inline">Other</label>
                <input v-model="affiliations.otherEngagementCategory" :disabled="loading" @input="revalidate" class="input" style="max-width: 200px;" type="text">
              </div>
            </div>

          </div>

          <!-- organization -->
          <div v-if="isContributor && isEditProfile" class="field" :class="{ 'divider-30': !showOrgLink }">
            <label class="label is-uppercase" :class="{ error: hasError('organizationName') }">Are you affiliated with an organization?<sup class="required">*</sup></label>
            <input v-model="affiliations.organization" :disabled="loading" @input="revalidate" class="input" type="text">
          </div>

          <!-- organization link -->
          <div v-if="showOrgLink" class="field divider-30">
            <label class="label is-uppercase" :class="{ error: hasError('organizationLink') }">Link to organization<sup class="required">*</sup></label>
            <input v-model="affiliations.organizationLink" :disabled="loading" @input="revalidate" class="input" type="text">
          </div>

          <div class="field my-4">
            <input :disabled="loading || hasFieldErrors || disableAfterSave" type="submit" class="button is-primary is-rounded is-fullwidth is-uppercase" :class="{'is-loading':loading}" :value="isLogin ? 'Log In' : isSignup ? 'Create Account' : isEditProfile ? 'Save' : null">
          </div>

          <div v-if="error" class="field">
            <p class="error has-text-centered is-uppercase">{{ error.message }}</p>
          </div>

          <p v-if="isLogin" class="has-text-centered">
            <router-link :to="{name:'PasswordReset'}">FORGOT PASSWORD?</router-link>
          </p>

          <p v-if="isEditProfile" class="has-text-centered">
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
