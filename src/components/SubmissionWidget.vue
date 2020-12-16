<script>

export default {
  props: ['sid', 'state'],
  data() {
    return {
      loading: true,
      sub: null
    }
  },
  methods: {
    deleteSubmission() {
      this.$store.dispatch('deleteSubmission', this.sub)
    }
  },
  created() {
    console.log('submission widget', this.sub)
    if (this.$store.state.submissionsIndex?.[this.sid]) {
      this.sub = this.$store.state.submissionsIndex[this.sid]
      this.loading = false
      return
    }
    this.$store.dispatch('indexSubmission', this.sid)
      .then(() => {
        this.sub = this.$store.state.submissionsIndex[this.sid]
        this.loading = false
      })
  }
}

</script>

<template>

<div class="p-5">
  <div>
    <div v-if="loading">
      <div class="button is-static is-loading">loading</div>
    </div>
    <div v-if="!loading && sub.type === 'book'">
      <h4>
        <i class="fas fa-book"></i> Book
      </h4>
      <div>Title: {{sub.title}}</div>
      <div>Author: {{sub.author}}</div>
    </div>
    <div v-if="!loading && sub.type === 'bundle'">
      <h4>
        <i class="fas fa-cubes"></i> Bundle
      </h4>
      <div>Name: {{sub.name}}</div>
      <div>Books: {{sub.books.length}}</div>
    </div>
    <hr/>
    <span v-if="state === 'review'" class="ml-3">On review</span>
    <span v-if="state === 'approve'" class="ml-3">Approved</span>
    <div v-if="state === 'reject'">
      <div>Rejected ({{sub?.approveComment}})</div>
      <div>
        <button @click="deleteSubmission()" class="is-flat">Delete</button>
      </div>
    </div>
  </div>
</div>

</template>
