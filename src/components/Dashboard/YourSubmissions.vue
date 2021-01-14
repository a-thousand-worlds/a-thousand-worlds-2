<script>
import Toggle from '@/components/Toggle'
import UserBookSubmission from '@/components/UserBookSubmission'

export default {
  components: {
    Toggle,
    UserBookSubmission,
  },
  props: [],
  computed: {
    acceptedSubmissions() {
      return this.filterByValue(this.userSubmissions, 'approve')
    },
    pendingSubmissions() {
      return this.filterByValue(this.userSubmissions, 'review')
    },
    rejectedSubmissions() {
      return this.filterByValue(this.userSubmissions, 'reject')
    },
    userSubmissions() {
      return this.$store.state.user.user.profile.submissions || {}
    },
  },
  methods: {
    /** Filters a collection by a value and returns ids. */
    filterByValue(collection, value) {
      return Object.entries(collection)
        .filter(([sid, v]) => v === value)
        .map(([sid, v]) => sid)
    },
  }
}

</script>

<template>
  <div>
    <div v-if="pendingSubmissions.length" class="my-20">
      <h2>{{ $can('review') ? 'Your ' : '' }}Pending Submissions</h2>
      <div class="columns is-multiline">
        <div v-for="sid of pendingSubmissions" :key="sid" class="column is-6-tablet is-4-desktop is-3-widescreen">
          <UserBookSubmission :sid="sid" />
        </div>
      </div>
    </div>

    <div v-if="acceptedSubmissions.length" class="my-20">
      <h2>{{ $can('review') ? 'Your ' : '' }}Accepted Submissions</h2>
      <div class="columns is-multiline">
        <div v-for="sid of acceptedSubmissions" :key="sid" class="column is-6-tablet is-4-desktop is-3-widescreen">
          <UserBookSubmission :sid="sid" />
        </div>
      </div>
    </div>

    <div v-if="rejectedSubmissions.length" class="my-20">
      <Toggle>
        <template #label>Not Approved</template>
        <template #content>
          <div class="columns is-multiline">
            <div v-for="sid of rejectedSubmissions" :key="sid" class="column is-6-tablet is-4-desktop is-3-widescreen">
              <UserBookSubmission :sid="sid" />
            </div>
          </div>
        </template>
      </Toggle>
    </div>

  </div>
</template>
