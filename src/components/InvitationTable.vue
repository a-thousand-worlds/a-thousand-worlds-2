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
      // ['used', 'created', 'email', 'firstName', 'lastName', 'role', 'resend', 'cancelled'],
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
      resendDisabled: false,
    }
  },
  methods: {
    cancel(invite) {
      this.$emit('cancel', invite)
    },
    resend(invite) {
      this.$emit('resend', invite)
      this.resendDisabled = true
    },
    /** Return the appropriate date based on showAccepted. */
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
      <th v-if="fields.includes('resend') || fields.includes('cancel')"></th>
    </thead>
    <tbody>
      <tr v-for="invite of invites" :key="invite.code">
        <td>{{ date(invite) }}</td>
        <td v-if="fields.includes('email')">{{ invite.email }}</td>
        <td v-if="fields.includes('firstName')">{{ invite.firstName }}</td>
        <td v-if="fields.includes('email')">{{ invite.lastName }}</td>
        <td class="is-capitalized">{{ invite.role }}</td>
        <td v-if="fields.includes('resend') || fields.includes('cancel')">
          <button @click="resend(invite)" class="is-flat" title="Resend invitation" :disabled="resendDisabled">
            <i class="fas fa-paper-plane"></i>
          </button>
          <button @click="cancel(invite)" class="is-flat" title="Cancel invitation">
            <i class="fas fa-times"></i>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
