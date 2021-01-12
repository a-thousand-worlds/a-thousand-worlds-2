<script>
// import dayjs from 'dayjs'
import ApprovalBookWidget from '@/components/ApprovalBookWidget'

export default {
  components: {
    ApprovalBookWidget,
  },
  props: ['group'],
  data: () => ({
    submitter: ''
  }),
  created () {
    this.$store.dispatch('submissions/books/loadContributorProfile', this.group.by)
      .then(profile => {
        this.submitter = profile.name || `${profile.firstName} ${profile.lastName}`
      })
  },
  methods: {
    async approveGroup() {
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch('submissions/books/approve', this.group.books)
      this.$store.commit('ui/setBusy', false)
    },
  }
}
</script>

<template>

  <div>

    <p v-if="!group?.books?.length" style="font-size: 20px;">No Submissions to review</p>

    <div v-else>
      <div>
        <button
          :disabled="$uiBusy"
          class="level-item is-flat is-underlined is-uppercase"
          @click="approveGroup()">Approve</button>
      </div>
      <div v-for="(sub, i) of group.books" :key="i">
        <ApprovalBookWidget :submission="sub" />
      </div>
      <div class="has-text-right mt-20">
        {{ submitter }}
      </div>
    </div>

  </div>

</template>
