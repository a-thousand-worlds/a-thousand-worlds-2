<script>
import BookCover from '@/components/BookCover'
import BookList from '@/components/BookList'

export default {
  components: {
    'book-cover': BookCover,
    'book-list': BookList
  }
}
</script>

<template>
  <div class="mx-20">
    <div :class="{masonry:$store.state.viewMode==='covers'}">
      <div class="masonry-item" v-for="(book, i) of $store.state.booksFiltered" :key="book.id">
        <book-cover v-if="$store.state.viewMode === 'covers'" :colorI="i" :book="book"></book-cover>
        <book-list v-if="$store.state.viewMode === 'list'" :colorI="i" :book="book"></book-list>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/vars.scss';

.masonry {
  column-count: 1;
  @include from($tablet) {
    column-count: 2;
  }
  @include from($desktop) {
    column-count: 3;
  }
  @include from($widescreen) {
    column-count: 4;
  }
}

.masonry-item {
  margin-bottom: 20px;
  break-inside: avoid-column;
}
</style>
