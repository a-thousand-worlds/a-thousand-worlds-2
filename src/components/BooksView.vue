<script>
import BookCoverView from '@/components/BookCoverView'
import BookListView from '@/components/BookListView'
import Loader from '@/components/Loader'

export default {
  components: {
    BookCoverView,
    BookListView,
    Loader,
  },
  computed: {
    books() {
      return this.$store.getters['books/filtered']
    },
    filters() {
      return Object.values(this.$store.state.books.filters)
    },
    loading() {
      return !this.$store.state.books.loaded || !this.$store.state.tags.books.loaded
    },
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

    <div v-if="loading" class="has-text-centered" style="margin-top: 20vh;">
      <Loader />
    </div>

    <div v-else>
      <div v-if="filters.length && books.length === 0" class="my-50 has-text-centered">
        <h2 class="mb-20">No matching books</h2>
        <p><a @click.prevent="resetFilter" class="button is-rounded is-primary">Reset Filter</a></p>
      </div>

      <div :class="{ masonry: $store.state.ui.viewMode === 'covers', 'with-bookmarks': $store.state.ui.bookmarksOpen }">
        <div v-for="book of books" :key="book.id" :class="{ 'masonry-item': true, ['masonry-item-' + $store.state.ui.viewMode] : true }">
          <BookCoverView v-if="$store.state.ui.viewMode === 'covers'" :book="book" />
          <BookListView v-else :book="book" />
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/style/vars.scss';

.masonry {
  column-count: 1;
  @include from($tablet) { column-count: 2; }
  @include from($desktop) { column-count: 3; }
  @include from($widescreen) { column-count: 4; }

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

  &.masonry-item-list {
    @include from($desktop) {
      margin: auto;
      width: 50%;
      max-width: 750px;
    }
  }
}
</style>
