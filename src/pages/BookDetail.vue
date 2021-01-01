<script>
import AuthorWidget from '@/components/AuthorWidget'
import BookDetailFooter from '@/components/BookDetailFooter'
import BookmarkButton from '@/components/BookmarkButton'
import BooksFilter from '@/components/BooksFilter'
import Clipboard from 'clipboard'
import CreatorsWidget from '@/components/CreatorsWidget'
import LazyImage from '@/components/LazyImage'
import NotFound from '@/pages/NotFound'
import PrevNext from '@/components/PrevNext'

export default {
  name: 'BookDetail',
  components: {
    AuthorWidget,
    BookDetailFooter,
    BookmarkButton,
    BooksFilter,
    CreatorsWidget,
    LazyImage,
    NotFound,
    PrevNext,
  },
  computed: {
    book() {
      return this.$store.state.books.loaded
        ? Object.values(this.$store.state.books.data).find(book => book.isbn === this.isbn)
        : null
    },
    isbn() {
      return this.$route.params.isbn
    },
  },
  mounted() {
    new Clipboard('#copy-link') // eslint-disable-line no-new
  },
}

</script>

<template>

  <teleport to="#books-filter-menu">
    <BooksFilter />
  </teleport>

  <div class="book-detail">

    <div class="columns mb-5">

      <div class="column is-narrow">
        <router-link :to="{ name: 'Home' }" class="is-uppercase is-primary">&lt; Back to Books</router-link>
      </div>

      <PrevNext v-if="book" :book="book" class="column" />
    </div>

    <div class="columns">

      <div class="column mr-0 is-two-fifths">
        <div v-if="book" class="book-cover-wrapper has-text-centered">
          <LazyImage class="cover" :src="book.cover" />
        </div>
      </div>

      <div class="column">

        <div v-if="!$store.state.books.loaded" class="my-50">
          <img src="@/assets/icons/loading.gif">
        </div>
        <div v-else-if="book">
          <div class="title-container divider-bottom is-flex is-justify-content-space-between">
            <h1 class="title">{{ book.title }}</h1>
            <div style="padding-top: 0px;"><BookmarkButton :book="book" /></div>
          </div>

          <div class="authors divider-bottom">
            <AuthorWidget v-for="person of book.authors" :key="person" class="mb-2" :name="person" />
            <CreatorsWidget v-if="book.creators" class="mb-2" :creators="book.creators" :linked="true" />
          </div>

          <p class="summary">{{ book.summary }}</p>

        </div>
        <div v-else>
          <NotFound />
        </div>

      </div>

    </div>

    <!-- Add a bottom spacer so that fixed position footer clears content when scrolled to the bottom. -->
    <div class="mb-7" />

  </div>

  <BookDetailFooter v-if="book" :book="book" />

</template>

<style lang="scss" scoped>
@import '@/assets/main.scss';

.book-detail {
  margin: 0 20px;
  max-width: $widescreen;
  @include from($desktop) {
    margin: 0 60px;
  }
}

.book-cover-wrapper {
  @include from($desktop) {
    margin-right: 20px;
  }
}

.title {
  line-height: 1;
  margin-bottom: 0;
}

.authors {
  font-size: 14px;
}

.summary {
  font-size: 18px;
  @include from($tablet) {
    font-size: 22px;
  }
}

</style>
