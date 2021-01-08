<script>
import SubmissionWidget from '@/components/SubmissionWidget'
import Toggle from '@/components/Toggle'

export default {
  components: {
    SubmissionWidget,
    Toggle,
  },
  props: [],
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
    <div v-if="pendingSubmissions.length" class="my-20">
      <h2>{{ $can('review') ? 'Your ' : '' }}Pending Submissions</h2>
      <div class="columns is-multiline">
        <div v-for="(sid, i) of pendingSubmissions" :key="i" class="column is-6-tablet is-4-desktop is-3-widescreen">
          <SubmissionWidget :sid="sid" />
        </div>
      </div>
    </div>

    <div v-if="acceptedSubmissions.length" class="my-20">
      <h2>{{ $can('review') ? 'Your ' : '' }}Accepted Submissions</h2>
      <div class="columns is-multiline">
        <div v-for="(sid, i) of acceptedSubmissions" :key="i" class="column is-6-tablet is-4-desktop is-3-widescreen">
          <SubmissionWidget :sid="sid" />
        </div>
      </div>
    </div>

    <div v-if="rejectedSubmissions.length" class="my-20">
      <Toggle>
        <template #label>Not Approved</template>
        <template #content>
          <div class="columns is-multiline">
            <div v-for="(sid, i) of rejectedSubmissions" :key="i" class="column is-6-tablet is-4-desktop is-3-widescreen">
              <SubmissionWidget :sid="sid" />
            </div>
          </div>
        </template>
      </Toggle>
    </div>

  </div>
</template>

<style scoped lang="scss">
@import '@/assets/style/vars.scss';

</style>
