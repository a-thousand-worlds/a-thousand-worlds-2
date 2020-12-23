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
    rejectedSubmissions() {
      return this.submissionsByStatus('reject')
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
      <h2>{{ $can('review') ? 'Your ' : '' }}Pending Submissions</h2>
      <div class="columns is-multiline">
        <div class="column is-6-tablet is-4-desktop is-3-widescreen" v-for="(sid, i) of pendingSubmissions" :key="i">
          <SubmissionWidget :sid="sid"/>
        </div>
      </div>
    </div>

    <div v-if="acceptedSubmissions.length">
      <h2>{{ $can('review') ? 'Your ' : '' }}Accepted Submissions</h2>
      <div class="columns is-multiline">
        <div class="column is-6-tablet is-4-desktop is-3-widescreen" v-for="(sid, i) of acceptedSubmissions" :key="i">
          <SubmissionWidget :sid="sid"/>
        </div>
      </div>
    </div>

    <div v-if="rejectedSubmissions.length">
      <h2>{{ $can('review') ? 'Your ' : '' }}Rejected Submissions</h2>
      <div class="columns is-multiline">
        <div class="column is-6-tablet is-4-desktop is-3-widescreen" v-for="(sid, i) of rejectedSubmissions" :key="i">
          <SubmissionWidget :sid="sid"/>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

</style>
