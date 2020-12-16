<script>
import dayjs from 'dayjs'
export default {
  name: 'InvitationTable',
  emits: ['cancel'],
  props: {
    invites: Array,
    fields: {
      type: Array,
      default: () => ['created', 'email', 'firstName', 'lastName', 'role'],
    }
  },
  methods: {
    cancel(invite) {
      this.$emit('cancel', invite)
    },
    /** Return the appropriate date based on showAccepted. */
    date(invite) {
      const dateField = this.fields.includes('used') ? 'used' : 'created'
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
      <th>{{ fields.includes('used') ? 'Accepted' : 'Invited' }}</th>
      <th>Email</th>
      <th>First</th>
      <th>Last</th>
      <th>Role</th>
      <th></th>
    </thead>
    <tbody>
      <tr v-for="invite of invites" :key="invite.code">
        <td>{{ date(invite) }}</td>
        <td>{{ invite.email }}</td>
        <td>{{ invite.firstName }}</td>
        <td>{{ invite.lastName }}</td>
        <td class="is-capitalized">{{ invite.role }}</td>
        <td v-if="fields.includes('cancel')">
          <button @click="cancel(invite)" class="is-flat" title="Cancel invitation">
            <i class="fas fa-times"></i>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
