<script>
import BookCover from '@/components/BookCover'
import BookList from '@/components/BookList'

export default {
  components: {
    'book-cover': BookCover,
    'book-list': BookList
  },
  methods: {
    logBooks() {
      console.log(this.$store.state)
    },
    resetFilter() {
      this.$store.commit('books/resetFilters')
    },
  },
}
</script>

<template>
  <div class="mx-20">
    <div v-if="$store.state.filter?.length && $store.state.booksFiltered.length === 0">
      <p class="mb-20">No books matching books. </p>
      <p><a @click.prevent="resetFilter">Reset Filter</a></p>
    </div>

    <div :class="{masonry:$store.state.ui.viewMode==='covers', 'with-bookmarks': $store.state.ui.bookmarksOpen}">
      <div class="masonry-item" v-for="book of $store.getters['books/filtered']" :key="book.id">
        <book-cover v-if="$store.state.ui.viewMode === 'covers'" :book="book"></book-cover>
        <book-list v-if="$store.state.ui.viewMode === 'list'" :book="book"></book-list>
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
  &.with-bookmarks {
    display: none;
    @include from($tablet) {
      column-count: 1;
      display: block;
    }
    @include from($widescreen) {
      column-count: 2;
      display: block;
    }
  }
}

.masonry-item {
  margin-bottom: 20px;
  break-inside: avoid-column;
}
</style>
