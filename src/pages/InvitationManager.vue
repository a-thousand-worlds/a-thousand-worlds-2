<script>
import InvitationTable from '@/components/InvitationTable'

const compare = (a, b) => a > b ? 1 : b > a ? -1 : 0
const compareBy = (prop, dir = 'asc') =>
  (a, b) => dir === 'asc'
    ? compare(a[prop], b[prop])
    : compare(b[prop], a[prop])

export default {
  name: 'InvitationManager',
  components: {
    InvitationTable,
  },
  computed: {
    cancelledInvites() {
      // eslint-disable-next-line fp/no-mutating-methods
      return Object.values(this.invites)
        .filter(invite => invite.cancelled)
        .sort(compareBy('cancelled', 'desc'))
    },
    invites() {
      return this.$store.getters['invites/getAll']()
    },
    pendingInvites() {
      // eslint-disable-next-line fp/no-mutating-methods
      return Object.values(this.invites)
        .filter(invite => !invite.used && !invite.cancelled)
        .sort(compareBy('createdAt', 'desc'))
    },
    acceptedInvites() {
      // eslint-disable-next-line fp/no-mutating-methods
      return Object.values(this.invites)
        .filter(invite => invite.used)
        .sort(compareBy('used', 'desc'))
    },
  },
  methods: {
    cancel(invite) {
      this.$store.dispatch('invites/save', {
        path: `${invite.code}/cancelled`,
        value: Date.now()
      })
      this.$store.dispatch('ui/popup', 'Invitation cancelled')
    },
    async resend(invite) {
      await this.$store.dispatch('invites/send', invite)
      this.$store.dispatch('ui/popup', 'Invitation sent!')
    },
  }
}

</script>

<template>

  <div class="is-flex is-justify-content-center">
    <div class="is-flex-grow-1 mx-20" style="max-width: 760px;">

      <div class="mb-5">
        <a @click.prevent="$router.back" class="is-uppercase is-primary">&lt; Back</a>
      </div>

      <h1 class="divider-bottom">Invitations</h1>

      <section class="my-30">
        <h2>Pending</h2>
        <InvitationTable v-if="pendingInvites.length" :invites="pendingInvites" :fields="['created', 'email', 'firstName', 'lastName', 'role', 'resend', 'cancel']" @resend="resend" @cancel="cancel" />
        <p v-else>There are no pending invitations.</p>
      </section>

      <section class="my-30">
        <h2>Accepted</h2>
        <InvitationTable v-if="acceptedInvites.length" :invites="acceptedInvites" :fields="['used', 'email', 'firstName', 'lastName', 'role', 'profile']" />
        <p v-else>There are no accepted invitations.</p>
      </section>

      <section class="my-30">
        <h2>Cancelled</h2>
        <InvitationTable v-if="cancelledInvites.length" :invites="cancelledInvites" :fields="['cancelled', 'email', 'firstName', 'lastName', 'role']" />
        <p v-else>There are no cancelled invitations.</p>
      </section>

    </div>
  </div>

</template>

<style scoped lang="scss">
</style>
