<script>
import InvitationTable from '@/components/InvitationTable'

export default {
  name: 'InvitationManager',
  components: {
    InvitationTable,
  },
  computed: {
    cancelledInvites() {
      return Object.values(this.invites).filter(invite => invite.cancelled)
    },
    invites() {
      return this.$store.getters['invites/getAll']()
    },
    pendingInvites() {
      return Object.values(this.invites).filter(invite => !invite.used && !invite.cancelled)
    },
    acceptedInvites() {
      return Object.values(this.invites).filter(invite => invite.used)
    },
  },
  methods: {
    cancel(invite) {
      this.$store.dispatch('invites/save', {
        path: `${invite.code}/cancelled`,
        value: Date.now()
      })
      this.$store.dispatch('alert', 'Invitation cancelled')
    },
    async resend(invite) {
      await this.$store.dispatch('invites/send', invite)
      this.$store.dispatch('alert', 'Invitation sent!')
    },
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
        <h2>Pending</h2>
        <InvitationTable v-if="pendingInvites.length" :invites="pendingInvites" :fields="['created', 'email', 'firstName', 'lastName', 'role', 'resend', 'cancel']" @resend="resend" @cancel="cancel" />
        <p v-else>There are no pending invitations.</p>
      </section>

      <section class="my-30">
        <h2>Accepted</h2>
        <InvitationTable v-if="acceptedInvites.length" :invites="acceptedInvites" :fields="['used', 'email', 'firstName', 'lastName', 'role']" />
        <p v-else>There are no accepted invitations.</p>
      </section>

      <section class="my-30">
        <h2>Cancelled</h2>
        <InvitationTable v-if="cancelledInvites.length" :invites="cancelledInvites" />
        <p v-else>There are no cancelled invitations.</p>
      </section>

    </div>
  </div>

</template>

<style scoped lang="scss">
</style>
