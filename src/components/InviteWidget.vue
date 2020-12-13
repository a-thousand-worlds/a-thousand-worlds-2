<script>
import _ from 'lodash'
import { validate as validateEmail } from 'email-validator'

/** Parse a line from the recipient input. */
const parseRecipient = s => {

  const words = s.split(/\s/g)
  const email = words[words.length - 1]

  if (!validateEmail(email)) {
    return {
      raw: s,
      isValid: false,
    }
  }

  return {
    firstName: words[0],
    lastName: words.slice(1, words.length - 1).join(' '),
    email,
    raw: s,
    isValid: true
  }
}

export default {
  props: {
    roles: {
      default: ['User', 'Contributor', 'Creator', 'Advisor', 'Owner'],
    }
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
    hasFieldErrors() {
      return Object.keys(this.error?.fields || {}).length > 0
    },
    recipients() {
      return this.emailInput
        ? this.emailInput.split('\n').map(parseRecipient)
        : []
    }
  },
  methods: {
    hasError(field) {
      return this.error?.fields?.[field]
    },
    send() {

      clearTimeout(this.disableSend)
      this.disableSend = setTimeout(() => {
        this.disableSend = null
      }, 1000)

      if (!this.validate()) return

      console.log(this.recipients)

      // return this.handleResponse(this.$store.dispatch('userLogin', {
      //   email: this.email,
      //   password: this.password
      // })
      //   .then(() => {
      //     // eslint-disable-next-line fp/no-mutating-methods
      //     this.$router.push({ name: 'Dashboard' })
      //   })
      // )
    },
    setInviteRole(value) {
      this.role = value
      this.dropdownActive = false
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

      const invalidRecipients = this.recipients.filter(recipient => !recipient.isValid)
      if (invalidRecipients.length > 0) {
        this.error = {
          message: `Invalid recipient${invalidRecipients.length > 1 ? 's' : ''}:`,
          data: invalidRecipients.map(recipient => recipient.raw).join('\n'),
          fields: { ...this.error?.fields, emailInput: true },
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
  <div>

    <p class="mb-10">Enter a list of names and emails (one per line)</p>

    <div class="field">
      <div class="control">
        <textarea class="textarea" :class="{ 'is-danger': hasError('emailInput')}" v-model="emailInput" :placeholder="'Sarah Lopez  sarah@test.com\nDillon Avery  dillon@test.com\nMattie Smith  mattie@test.com\n...'" />
      </div>
    </div>

    <div class="field is-grouped is-flex">
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
      <p class="error">{{ error.data }}</p>
    </div>

  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

</style>
