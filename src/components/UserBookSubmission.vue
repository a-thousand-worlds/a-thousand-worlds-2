<script>
import StaticBookCover from '@/components/StaticBookCover'
import BookDetailLink from '@/components/BookDetailLink'

export default {
  components: {
    BookDetailLink,
    StaticBookCover,
  },
  props: ['sid'],
  computed: {
    book() {
      return Object.values(this.$store.state.books.data)
        .find(book => book.isbn === this.sub?.isbn)
    },
    sub() {
      return this.$store.state.submissions.books.data[this.sid]
    },
  },
}

</script>

<template>

  <div v-if="sub">
    <BookDetailLink v-if="book" :book="book">
      <StaticBookCover :book="sub" style="max-width: 200px;" />
    </BookDetailLink>
    <StaticBookCover v-else :book="sub" style="max-width: 200px;" />
  </div>
  <!-- <div v-else-if="bookSub?.type === 'bundle'">
    <h4>
      <i class="fas fa-cubes" /> Bundle
    </h4>
    <div>Name: {{ bookSub.name }}</div>
    <div>Books: {{ bookSub.books.length }}</div>
  </div> -->

</template>
