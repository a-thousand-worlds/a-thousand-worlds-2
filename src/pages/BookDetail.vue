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
  data() {
    return {
      isbn: this.$router.currentRoute._value.params.isbn,
    }
  },
  computed: {
    book() {
      return this.$store.state.books.loaded
        ? Object.values(this.$store.state.books.data).find(book => book.isbn === this.isbn)
        : null
    },
  },
  mounted() {
    new Clipboard('#copy-link') // eslint-disable-line no-new
  },
  watch: {
    '$route'() {
      this.isbn = this.$router.currentRoute._value.params.isbn
    }
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
      <div class="column mr-1 is-two-fifths" style="max-width: 720px">
        <div v-if="book" class="book-cover-wrapper">
          <LazyImage class="cover" :src="book.cover" />
        </div>
      </div>

      <div class="column" style="max-width: 720px;">

        <div v-if="!$store.state.books.loaded" class="my-50">
          <img src="@/assets/icons/loading.gif" />
        </div>
        <div v-else-if="book">
          <div class="title-container divider-bottom is-flex is-justify-content-space-between">
            <h1 class="title">{{book.title}}</h1>
            <div style="padding-top: 0px;"><BookmarkButton :book="book" /></div>
          </div>

          <div class="authors divider-bottom">
            <AuthorWidget class="mb-2" v-for="person of book.authors" :key="person" :name="person" />
            <CreatorsWidget class="mb-2" v-if="book.creators" :creators="book.creators" :linked="true" />
          </div>

          <p style="font-size: 22px;">{{book.summary}}</p>

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
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/vars.scss';

.book-detail {
  margin: 0 20px;
  @include from($desktop) {
    margin: 0 60px;
  }
}

.title {
  line-height: 1;
  margin-bottom: 0;
}

.authors {
  font-size: 14px;
}

</style>
