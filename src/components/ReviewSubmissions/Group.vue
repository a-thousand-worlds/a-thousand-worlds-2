<script>
import BookApproval from '@/components/ReviewSubmissions/BookApproval'

export default {
  components: {
    BookApproval,
  },
  props: ['group', 'type'],
  data: () => ({
    submitter: ''
  }),
  created () {
    this.$store.dispatch(`submissions/${this.type}/loadContributorProfile`, this.group.by)
      .then(profile => {
        this.submitter = profile.name || `${profile.firstName} ${profile.lastName}`
      })
  },
  methods: {
    async approveGroup() {
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch(`submissions/${this.type}/approve`, this.group[this.type])
      this.$store.commit('ui/setBusy', false)
    },
  }
}
</script>

<template>

  <div>

    <p v-if="!group?.[type]?.length" style="font-size: 20px;">No Submissions to review</p>

    <div v-else>
      <div>
        <button
          :disabled="$uiBusy"
          class="level-item is-flat is-underlined is-uppercase"
          @click="approveGroup()">Approve</button>
      </div>
      <div v-for="(sub, i) of group[type]" :key="i">
        <BookApproval :submission="sub" />
      </div>
      <div class="has-text-right mt-20">
        {{ submitter }}
      </div>
    </div>

  </div>

</template>
