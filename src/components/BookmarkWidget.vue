<script>
import BookListView from '@/components/BookListView'

export default {
  components: {
    BookListView,
  },
  props: ['mark'],
  data() {
    return {
      book: null,
      bundle: null
    }
  }
}
</script>

<template>
  <div>
    <div v-if="mark.type === 'book'" class="container">
      <BookListView :book="$store.state.books.data[mark.id]" />
    </div>
    <div v-if="mark.type === 'bundle'">
      {{ mark.type }}: {{ mark.id }}
    </div>
  </div>
</template>
