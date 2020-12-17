<script>
import dayjs from 'dayjs'
export default {
  name: 'InvitationTable',
  emits: ['cancel', 'resend'],
  props: {
    invites: Array,
    fields: {
      type: Array,
      default: () => ['created', 'email', 'firstName', 'lastName', 'role'],
      // possible values
      // ['created', 'used', 'cancelled', 'email', 'firstName', 'lastName', 'role', 'resend', 'cancel'],
    }
  },
  computed: {
    dateHeader() {
      return this.fields.includes('cancelled') ? 'Cancelled'
        : this.fields.includes('used') ? 'Accepted'
        : 'Invited'
    }
  },
  data() {
    return {
      resendDisabled: {},
    }
  },
  methods: {
    cancel(invite) {
      this.$emit('cancel', invite)
    },
    resend(invite) {
      this.$emit('resend', invite)
      this.resendDisabled[invite.code] = true
    },
    /** Return the appropriate date based on fields. */
    date(invite) {
      const dateField = this.fields.includes('cancelled') ? 'cancelled'
        : this.fields.includes('used') ? 'used'
        : 'created'
      return invite[dateField]
        ? this.format(invite[dateField])
        : null
    },
    format(date) {
      return dayjs(date).format('MMMM DD, YYYY')
    }
  },
}
</script>

<template>
  <table class="table w-100">
    <thead>
      <th>{{ dateHeader }}</th>
      <th>Email</th>
      <th>First</th>
      <th>Last</th>
      <th>Role</th>
      <th></th>
    </thead>
    <tbody>
      <tr v-for="invite of invites" :key="invite.code">
        <td>{{ date(invite) }}</td>
        <td v-if="fields.includes('email')">{{ invite.email }}</td>
        <td v-if="fields.includes('firstName')">{{ invite.firstName }}</td>
        <td v-if="fields.includes('email')">{{ invite.lastName }}</td>
        <td class="is-capitalized">{{ invite.role }}</td>
        <td>
          <button v-if="fields.includes('resend')" @click="resend(invite)" class="is-flat" title="Resend invitation" :disabled="resendDisabled[invite.code]">
            <i class="fas fa-paper-plane"></i>
          </button>
          <button v-if="fields.includes('cancel')" @click="cancel(invite)" class="is-flat" title="Cancel invitation">
            <i class="fas fa-times"></i>
          </button>
          <!-- <button v-if="fields.includes('profile')" class="is-flat" title="View profile">
            <i class="fas fa-user"></i>
          </button> -->
        </td>
      </tr>
    </tbody>
  </table>
</template>
