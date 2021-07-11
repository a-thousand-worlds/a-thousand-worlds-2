<script>
import BookListView from '@/components/BookListView'

export default {
  components: {
    BookListView,
  },
  props: {
    bookmark: {
      required: true,
    },
  },
  computed: {
    book() {
      return {
        id: this.bookmark.id,
        ...this.$store.state.books.data[this.bookmark.id],
      }
    },
  },
}
</script>

<template>
  <div>
    <div v-if="bookmark.type === 'book'" class="container">
      <BookListView :book="book" />
    </div>
    <div v-if="bookmark.type === 'bundle'">{{ bookmark.type }}: {{ bookmark.id }}</div>
  </div>
</template>
