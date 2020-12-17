<script>
import parseRecipient from '@/util/parseRecipient'

export default {
  props: {
    roles: {
      type: Array,
      default: () => ['user', 'contributor', 'creator', 'advisor', 'owner'],
    },
    format: String,
  },
  data() {
    return {
      disableSend: null,
      dropdownActive: false,
      emailInput: '',
      error: null,
      message: null,
      role: null,
    }
  },
  computed: {
    existingInvites() {
      return this.recipients.filter(recipient =>
        this.$store.getters['invites/findBy']('email', recipient.email)
      )
    },
    existingRecipients() {
      return this.recipients.filter(recipient =>
        this.$store.getters['users/findBy']('profile.email', recipient.email)
      )
    },
    hasFieldErrors() {
      return Object.keys(this.error?.fields || {}).length > 0
    },
    invalidRecipients() {
      return this.recipients.filter(recipient => !recipient.isValid)
    },
    recipients() {
      return this.emailInput
        ? this.emailInput.split(/[\n,]/g).map(parseRecipient)
        : []
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
            message: err.message
          }
          this.loading = false
        })
    },

    hasError(field) {
      return this.error?.fields?.[field]
    },

    reset() {
      this.role = null
      this.emailInput = null
      this.error = null
    },

    async send() {

      this.setInviteDropdown(false)

      clearTimeout(this.disableSend)
      this.disableSend = setTimeout(() => {
        this.disableSend = null
      }, 1000)

      if (!this.validate()) return

      const invitePromises = this.recipients.map(recipient =>
        this.$store.dispatch('invites/send', {
          recipient,
          role: this.role,
        })
      )

      await this.handleResponse(Promise.all(invitePromises).then(() => {
        this.message = `Email${this.recipients.length > 1 ? 's' : ''} sent!`
        this.reset()
      }))
    },

    setInviteRole(value) {
      this.role = value
      this.dropdownActive = false
      if (this.error) {
        this.validate()
      }
    },

    setInviteDropdown(value) {
      this.dropdownActive = value
    },

    toggleInviteDropdown() {
      this.dropdownActive = !this.dropdownActive
    },

    /** Checks all fields for errors and updates this.error. */
    validate() {

      this.error = null

      if (!this.emailInput) {
        this.error = {
          message: 'Enter one or more emails',
          fields: { ...this.error?.fields, emailInput: true },
        }
      }
      else if (!this.role) {
        this.error = {
          message: 'Enter a role',
          fields: { ...this.error?.fields, role: true },
        }
      }
      else if (this.invalidRecipients.length > 0) {
        this.error = {
          message: `Invalid recipient${this.invalidRecipients.length > 1 ? 's' : ''}:`,
          data: this.invalidRecipients.map(recipient => recipient.raw),
          fields: { ...this.error?.fields, emailInput: true },
        }
      }
      else if (this.existingRecipients.length > 0) {
        this.error = {
          message: `Already registered:`,
          data: this.existingRecipients.map(recipient => recipient.raw),
          fields: { ...this.error?.fields, emailInput: true },
        }
      }
      else if (this.existingInvites.length > 0) {
        this.error = {
          message: `Already Invited:`,
          data: this.existingInvites.map(recipient => recipient.raw),
          fields: { ...this.error?.fields, emailInput: true },
        }
      }

      return !this.error
    },
  },
}

</script>

<template>
  <div>

    <p v-if="format !== 'compact'" class="mb-10">Enter a list of names and emails (one per line)</p>

    <div v-if="format !== 'compact'" class="field">
      <div class="control">
        <textarea class="textarea" :class="{ 'is-danger': hasError('emailInput')}" v-model="emailInput" :placeholder="'Sarah Lopez - sarah@test.com\nDillon Avery - dillon@test.com\nMattie Smith - mattie@test.com\n...'" />
      </div>
    </div>

    <div class="field is-grouped is-flex">
      <div v-if="format === 'compact'" class="control is-flex-grow-1">
        <textarea class="textarea" :class="{ 'is-danger': hasError('emailInput')}" v-model="emailInput" placeholder="Sarah Lopez - sarah@test.com" style="min-height: 0; padding-top: 0.5rem; padding-bottom: 0.5rem;" />
      </div>
      <div class="control">
        <div :class="{ dropdown: true, 'is-active': dropdownActive }">
          <div class="dropdown-trigger">
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" @click.prevent.stop="toggleInviteDropdown">
              <span>{{ role || 'CHOOSE ROLE' }}</span>
              <span class="icon is-small">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
          <div class="dropdown-menu" :class="{ 'is-danger': hasError('role') }" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <a class="dropdown-item is-capitalized" :class="{ 'is-active': role === userRole }" v-for="userRole in roles" :key="userRole" @click.prevent="setInviteRole(userRole)">
                {{ userRole }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="control">
        <button class="button is-primary" @click.prevent="send" :disabled="disableSend">Invite</button>
      </div>
    </div>

    <div v-if="message" class="field">
      <p class="message is-uppercase">{{ message }}</p>
    </div>

    <div v-if="error" class="field">
      <p class="error is-uppercase">{{ error.message }}</p>
      <div v-if="error.data" class="error">
        <p v-for="item of error.data" :key="item">{{ item }}</p>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

</style>