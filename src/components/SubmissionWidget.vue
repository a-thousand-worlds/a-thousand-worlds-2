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
  },
}

</script>

<template>

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

</template>
