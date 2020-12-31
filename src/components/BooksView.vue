<script>
import BookCover from '@/components/BookCover'
import BookList from '@/components/BookList'

export default {
  components: {
    BookCover,
    BookList,
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
    <div v-if="$store.state.filter?.length && $store.getters['books/filtered']?.length === 0">
      <p class="mb-20">No books matching books. </p>
      <p><a @click.prevent="resetFilter">Reset Filter</a></p>
    </div>

    <div :class="{masonry:$store.state.ui.viewMode==='covers', 'with-bookmarks': $store.state.ui.bookmarksOpen}">
      <div class="masonry-item" v-for="book of $store.getters['books/filtered']" :key="book.id">
        <BookCover v-if="$store.state.ui.viewMode === 'covers'" :book="book" />
        <BookList v-if="$store.state.ui.viewMode === 'list'" :book="book" />
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
