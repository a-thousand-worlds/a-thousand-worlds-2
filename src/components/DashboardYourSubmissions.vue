<script>
import SubmissionWidget from '@/components/SubmissionWidget'

export default {
  props: [],
  components: {
    SubmissionWidget,
  },
  computed: {
    acceptedSubmissions() {
      return this.submissionsByStatus('approve')
    },
    pendingSubmissions() {
      return this.submissionsByStatus('review')
    },
    userSubmissions() {
      return this.$store.state.user.user.profile.submissions || {}
    },
  },
  methods: {
    submissionsByStatus(status) {
      return Object.entries(this.userSubmissions)
        .filter(([sid, value]) => value === status)
        .map(([sid, value]) => sid)
    },
  }
}

</script>

<template>
  <div>
    <div v-if="pendingSubmissions.length">
      <h2>Pending Submissions</h2>
      <div class="columns is-multiline">
        <div class="column is-6-tablet is-4-desktop is-3-widescreen" v-for="(sid, status) of pendingSubmissions" :key="sid">
          <SubmissionWidget :sid="sid" :state="status"/>
        </div>
      </div>
    </div>

    <div v-if="acceptedSubmissions.length">
      <h2>Accepted Submissions</h2>
      <div class="columns is-multiline">
        <div class="column is-6-tablet is-4-desktop is-3-widescreen" v-for="(sid, status) of acceptedSubmissions" :key="sid">
          <SubmissionWidget :sid="sid" :state="status"/>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

</style>
