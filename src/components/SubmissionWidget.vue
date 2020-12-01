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
        console.log('sub', this.sub)
        this.loading = false
      })
  }
}
</script>

<template>
  <div v-if="loading">
    <div class="button is-static is-loading">loading</div>
  </div>
  <div v-if="!loading && sub.type === 'book'">
    <h4 v-if="sub.type==='book'">
      <i class="fas fa-book"></i> Book
    </h4>
    <div>{{sub.title}}</div>
  </div>
</template>
