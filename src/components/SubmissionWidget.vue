<script>
import StaticBookCover from '@/components/StaticBookCover'

export default {
  props: ['sid', 'state'],
  components: {
    StaticBookCover,
  },
  data() {
    return {
      loading: true,
      sub: null
    }
  },
  methods: {
    deleteSubmission() {
      this.$store.dispatch('bookSubmissions/delete', this.sid)
    }
  },
  created() {
    if (this.$store.state.bookSubmissions.data.[this.sid]) {
      this.sub = this.$store.state.bookSubmissions.data[this.sid]
      this.loading = false
      return
    }
    this.$store.dispatch('bookSubmissions/loadOne', this.sid)
      .then(() => {
        this.sub = this.$store.state.bookSubmissions.data[this.sid]
        this.loading = false
      })
  }
}

</script>

<template>

<div>

  <div v-if="loading">
    <div class="button is-static is-loading">loading</div>
  </div>
  <div v-else-if="sub.type === 'book'">
    <StaticBookCover :book="sub" />
  </div>
  <div v-else-if="sub.type === 'bundle'">
    <h4>
      <i class="fas fa-cubes"></i> Bundle
    </h4>
    <div>Name: {{sub.name}}</div>
    <div>Books: {{sub.books.length}}</div>
  </div>

  <span v-if="state === 'review'" class="ml-3">On review</span>
  <span v-if="state === 'approve'" class="ml-3">Approved</span>
  <div v-if="state === 'reject'">
    <div>Rejected ({{sub?.approveComment}})</div>
    <div>
      <button @click="deleteSubmission()" class="is-flat">Delete</button>
    </div>
  </div>
</div>

</template>
