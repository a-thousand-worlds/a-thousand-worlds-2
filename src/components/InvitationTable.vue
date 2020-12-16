<script>
import dayjs from 'dayjs'
export default {
  name: 'InvitationTable',
  props: ['invites', 'showAccepted'],
  methods: {
    /** Return the appropriate date based on showAccepted. */
    date(invite) {
      const dateField = this.showAccepted ? 'used' : 'created'
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
      <th>{{ showAccepted ? 'Accepted' : 'Invited' }}</th>
      <th>Email</th>
      <th>First</th>
      <th>Last</th>
      <th>Role</th>
    </thead>
    <tbody>
      <tr v-for="invite of invites" :key="invite.code">
        <td>{{ date(invite) }}</td>
        <td>{{ invite.email }}</td>
        <td>{{ invite.firstName }}</td>
        <td>{{ invite.lastName }}</td>
        <td class="is-capitalized">{{ invite.role }}</td>
      </tr>
    </tbody>
  </table>
</template>
