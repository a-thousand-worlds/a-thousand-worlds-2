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
    isFiltered() {
      return this.$store.getters['books/isFiltered']
    },
    loading() {
      // return false
      return !this.$store.state.books.loaded || !this.$store.state.tags.books.loaded
    },
  },
  methods: {
    resetFilter() {
      this.$store.dispatch('books/resetFilters')
    },
  },
}
</script>

<template>
  <div class="mx-20">
    <div v-if="loading" class="has-text-centered" style="margin-top: 20vh">
      <Loader />
    </div>

    <div v-else>
      <!-- no matching books -->
      <div v-if="isFiltered && books.length === 0" class="my-50 has-text-centered">
        <h2 class="mb-20">No matching books</h2>
        <p><a @click.prevent="resetFilter" class="button is-rounded is-primary">Reset Filter</a></p>
      </div>

      <!-- shared list -->
      <div v-if="$store.state.books?.idFilters.length > 0" class="mb-30 has-text-centered">
        <h2 class="mb-20">Someone shared a list of books with you!</h2>
      </div>

      <!-- books -->
      <div
        :class="{
          masonry: $store.state.ui.viewMode === 'covers',
          'with-bookmarks': $store.state.ui.bookmarksOpen,
        }"
      >
        <div
          v-for="book of books"
          :key="book.id"
          :class="{ 'masonry-item': true, ['masonry-item-' + $store.state.ui.viewMode]: true }"
        >
          <BookCoverView v-if="$store.state.ui.viewMode === 'covers'" :book="book" />
          <BookListView v-else :book="book" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import 'bulma/sass/utilities/_all.sass';
@import '@/assets/style/vars.scss';

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

  &.masonry-item-list {
    @include from($desktop) {
      margin: auto;
      width: 33%;
      min-width: 390px; // make sure there is enough room fro images in cover view to be at least 150px wide
    }
  }
}

.masonry-item {
  // limit to max scaled width of actual cover image
  max-width: 400px;
  margin: 0 auto 20px auto;
}
</style>
