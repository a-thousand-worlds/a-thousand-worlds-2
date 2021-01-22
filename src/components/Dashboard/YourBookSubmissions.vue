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
      return this.filterByValue(this.userBookSubmissions, 'approved')
    },
    pendingSubmissions() {
      return this.filterByValue(this.userBookSubmissions, 'pending')
    },
    rejectedSubmissions() {
      return this.filterByValue(this.userBookSubmissions, 'rejected')
    },
    userBookSubmissions() {
      const submissions = this.$store.state.user.user.profile.submissions || {}
      return Object.keys(submissions).reduce((accum, id) => ({
        ...accum,
        ...this.bookSubmission(id) ? { [id]: submissions[id] } : null
      }), {})
    },
  },
  methods: {
    /** Gets a book submission from a user submission id. */
    bookSubmission(sid) {
      return this.$store.state.submissions.books.data[sid]
    },
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
    <div v-if="pendingSubmissions.length">
      <h2>{{ $can('review') ? 'Your ' : '' }}Pending Submissions</h2>
      <div class="is-flex is-flex-wrap-wrap">
        <div v-for="sid of pendingSubmissions" :key="sid" class="mr-20 mb-20">
          <UserBookSubmission :sid="sid" />
        </div>
      </div>
    </div>

    <div v-if="acceptedSubmissions.length">
      <h2>{{ $can('review') ? 'Your ' : '' }}Accepted Submissions</h2>
      <div class="is-flex is-flex-wrap-wrap">
        <div v-for="sid of acceptedSubmissions" :key="sid" class="mr-20 mb-20">
          <UserBookSubmission :sid="sid" />
        </div>
      </div>
    </div>

    <div v-if="rejectedSubmissions.length">
      <Toggle>
        <template #label>Not Approved</template>
        <template #content>
          <div class="is-flex is-flex-wrap-wrap mt-10">
            <div v-for="sid of rejectedSubmissions" :key="sid" class="mr-20 mb-20">
              <UserBookSubmission :sid="sid" />
            </div>
          </div>
        </template>
      </Toggle>
    </div>

  </div>
</template>
