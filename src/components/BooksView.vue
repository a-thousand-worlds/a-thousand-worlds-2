<script>
import BookCover from '@/components/BookCover'
import BookList from '@/components/BookList'

export default {
  computed: {
    books() {
      return Object.keys(this.$store.state.books)
        .map(x => this.$store.state.books[x])
        .filter(x => typeof x.id === 'string' && x.id.length > 8)
    },

  },
  components: {
    'book-cover': BookCover,
    'book-list': BookList
  }
}
</script>

<template>
  <div :class="{masonry:$store.state.viewMode==='covers'}">
    <div class="masonry-item" v-for="book of books" :key="book.id">
      <book-cover v-if="$store.state.viewMode === 'covers'" :book="book"></book-cover>
      <book-list v-if="$store.state.viewMode === 'list'" :book="book"></book-list>
    </div>
  </div>
</template>

<style lang="css" scoped>
@media only screen and (max-width: 480px) {
  .masonry {
    column-count: 1;
  }
}
@media only screen and (min-width: 481px) and (max-width: 780px) {
  .masonry {
    column-count: 2;
  }
}
@media only screen and (min-width: 781px) and (max-width: 1280px) {
  .masonry {
    column-count: 3;
  }
}
@media only screen and (min-width: 1281px) {
  .masonry {
    column-count: 4;
  }
}

.masonry-item {
  margin-bottom: 30px;
}
</style>
