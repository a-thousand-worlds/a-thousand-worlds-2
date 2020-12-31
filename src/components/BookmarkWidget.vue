<script>
import BookList from '@/components/BookList'

export default {
  components: {
    BookList,
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
  <div class="container" v-if="mark.type === 'book'">
    <BookList :book="$store.state.books.data[mark.id]"/>
  </div>
  <div v-if="mark.type === 'bundle'">
    {{mark.type}}: {{mark.id}}
  </div>
</div>
</template>
