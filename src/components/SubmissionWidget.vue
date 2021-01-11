<script>
import StaticBookCover from '@/components/StaticBookCover'
import BookDetailRoute from '@/components/BookDetailRoute'

export default {
  components: {
    BookDetailRoute,
    StaticBookCover,
  },
  props: ['sid'],
  computed: {
    book() {
      return Object.values(this.$store.state.books.data)
        .find(book => book.isbn === this.sub.isbn)
    },
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
    <BookDetailRoute v-if="book" :book="book">
      <StaticBookCover :book="sub" />
    </BookDetailRoute>
    <StaticBookCover v-else :book="sub" />
  </div>
  <div v-else-if="sub?.type === 'bundle'">
    <h4>
      <i class="fas fa-cubes" /> Bundle
    </h4>
    <div>Name: {{ sub.name }}</div>
    <div>Books: {{ sub.books.length }}</div>
  </div>

</template>
