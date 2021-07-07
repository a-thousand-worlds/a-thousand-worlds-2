<script>
import dayjs from 'dayjs'
export default {
  name: 'InvitationTable',
  props: {
    invites: Array,
    fields: {
      type: Array,
      default: () => ['createdAt', 'email', 'firstName', 'lastName', 'role'],
      // possible values
      // ['createdAt', 'used', 'cancelled', 'email', 'firstName', 'lastName', 'role', 'resend', 'cancel'],
    }
  },
  emits: ['cancel', 'resend'],
  data() {
    return {
      resendDisabled: {},
    }
  },
  computed: {
    dateHeader() {
      return this.fields.includes('cancelled') ? 'Cancelled'
        : this.fields.includes('used') ? 'Accepted'
        : 'Invited'
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
        : 'createdAt'
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
      <th />
    </thead>
    <tbody>
      <tr v-for="invite of invites" :key="invite.code">
        <td>{{ date(invite) }}</td>
        <td v-if="fields.includes('email')">{{ invite.email }}</td>
        <td v-if="fields.includes('firstName')">{{ invite.firstName }}</td>
        <td v-if="fields.includes('email')">{{ invite.lastName }}</td>
        <td class="is-capitalized">{{ invite.role }}</td>
        <td>
          <button v-if="fields.includes('resend')" class="is-flat" v-tippy="{ content: 'Resend invitation' }" :disabled="resendDisabled[invite.code]" @click="resend(invite)">
            <i class="fas fa-paper-plane" />
          </button>
          <button v-if="fields.includes('cancel')" class="is-flat" v-tippy="{ content: 'Cancel invitation' }" @click="cancel(invite)">
            <i class="fas fa-times" />
          </button>
          <!-- <button v-if="fields.includes('profile')" class="is-flat" v-tippy="{ content: 'View profile' }">
            <i class="fas fa-user"></i>
          </button> -->
        </td>
      </tr>
    </tbody>
  </table>
</template>
