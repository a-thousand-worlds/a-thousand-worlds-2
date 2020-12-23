<script>
import StaticBookCover from '@/components/StaticBookCover'

export default {
  props: ['sid'],
  components: {
    StaticBookCover,
  },
  computed: {
    sub() {
      return this.$store.state.bookSubmissions.data[this.sid]
    },
    state() {
      return this.sub?.approvedAt ? this.sub?.approved ? 'approve' : 'reject' : 'review'
    }
  },
  methods: {
    async deleteSubmission() {
      const ok = await this.$store.dispatch('ui/confirm', 'Remove submission?')
      if (ok) this.$store.dispatch('bookSubmissions/delete', this.sid)
      this.$store.dispatch('ui/popup', 'Removed')
    }
  },
}

</script>

<template>

<div>

  <div v-if="!$store.state.bookSubmissions.loaded">
    <div class="button is-static is-loading">loading</div>
  </div>
  <div v-else-if="sub?.type === 'book'">
    <StaticBookCover :book="sub" />
  </div>
  <div v-else-if="sub?.type === 'bundle'">
    <h4>
      <i class="fas fa-cubes"></i> Bundle
    </h4>
    <div>Name: {{sub.name}}</div>
    <div>Books: {{sub.books.length}}</div>
  </div>
  <!-- // separated by bloks already
  <span v-if="state === 'review'" class="ml-3">On review</span>
  <span v-if="state === 'approve'" class="ml-3">Approved</span>
  -->
  <div v-if="state === 'reject'">
    <div>Rejected ({{sub?.approveComment}})</div>
    <div>
      <button @click="deleteSubmission()" class="is-flat">Delete</button>
    </div>
  </div>
</div>

</template>
