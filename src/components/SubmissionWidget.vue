<script>
export default {
  props: ['sid'],
  data() {
    return {
      loading: true,
      sub: null
    }
  },
  created() {
    if (this.$store.state.submissionsIndex[this.sid]) {
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
<div class="box p-5">
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
    <hr>
    <i class="fas fa-circle" :class="{ 'is-primary': sub.approved, 'is-secondary': !sub.approved }"></i>
    <span class="ml-3" v-if="sub.approved">Approved</span>
    <span class="ml-3" v-if="!sub.approved">Checking</span>
  </div>
</div>
</template>
