<script>
import dayjs from 'dayjs'

export default {
  name: 'InvitationManager',
  computed: {
    invites() {
      return this.$store.getters['invites/getAll']()
    }
  },
  methods: {
    format(date) {
      return dayjs(date).format('MMMM DD, YYYY')
    }
  }
}

</script>

<template>

  <div class="is-flex is-justify-content-center">
    <div class="is-flex-grow-1 mx-20" style="max-width: 760px;">

      <div class="mb-5">
        <router-link :to="{ name: 'Dashboard' }" class="is-uppercase is-primary">&lt; Back to Dashboard</router-link>
      </div>

      <h1 class="divider-bottom">Invitation Manager</h1>

      <section class="my-30">
        <table class="table w-100">
          <thead>
            <th>Created</th>
            <th>Email</th>
            <th>First</th>
            <th>Last</th>
            <th>Role</th>
          </thead>
          <tbody>
            <tr v-for="invite of invites" :key="invite.code">
              <td>{{ format(invite.created) }}</td>
              <td>{{ invite.email }}</td>
              <td>{{ invite.firstName }}</td>
              <td>{{ invite.lastName }}</td>
              <td class="is-capitalized">{{ invite.role }}</td>
            </tr>
          </tbody>
        </table>
      </section>

    </div>
  </div>

</template>

<style scoped lang="scss">
</style>
