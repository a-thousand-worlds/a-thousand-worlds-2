<script>
import AuthorWidget from '@/components/AuthorWidget'
import BookDetailFooter from '@/components/BookDetailFooter'
import BookDetailRoute from '@/components/BookDetailRoute'
import BookmarkButton from '@/components/BookmarkButton'
import BooksFilter from '@/components/BooksFilter'
import Clipboard from 'clipboard'
import CreatorsWidget from '@/components/CreatorsWidget'
import LazyImage from '@/components/LazyImage'
import NotFound from '@/pages/NotFound'

export default {
  name: 'BookDetail',
  components: {
    AuthorWidget,
    BookDetailFooter,
    BookDetailRoute,
    BookmarkButton,
    BooksFilter,
    CreatorsWidget,
    LazyImage,
    NotFound,
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
    id() {
      return this.book?.id
    },
    nextBook() {
      const list = this.$store.getters['books/filtered']
      const pos = list.map(x => x.id).indexOf(this.id)
      return list[pos + 1]
    },
    prevBook() {
      const list = this.$store.getters['books/filtered']
      const pos = list.map(x => x.id).indexOf(this.id)
      return list[pos - 1]
    }
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
    <books-filter></books-filter>
  </teleport>

  <div class="book-detail">

    <div class="columns mb-5">

      <div class="column is-narrow">
        <router-link :to="{ name: 'Home' }" class="is-uppercase is-primary">&lt; Back to Books</router-link>
      </div>

      <div class="column prev-next">
        <BookDetailRoute v-if="prevBook" :book="prevBook" class="is-uppercase is-primary mr-6" style="white-space: nowrap;">&lt; Previous Book</BookDetailRoute>
        <!-- separating character needed otherwise the two links do not wrap -->
        <span style="visibility: hidden;"> | </span>
        <BookDetailRoute v-if="nextBook" :book="nextBook" class="is-uppercase is-primary" style="white-space: nowrap;">Next Book &gt;</BookDetailRoute>
      </div>
    </div>

    <div class="columns">
      <div class="column mr-1 is-two-fifths" style="max-width: 720px">
        <div v-if="book" class="book-cover-wrapper">
          <lazy-image class="cover" :src="book.cover" />
        </div>
      </div>

      <div class="column" style="max-width: 720px;">

        <div v-if="!$store.state.books.loaded" class="my-50">
          <img src="@/assets/icons/loading.gif" />
        </div>
        <div v-else-if="book">
          <div class="title-container divider-bottom is-flex is-justify-content-space-between">
            <h1 class="title">{{book.title}}</h1>
            <div style="padding-top: 0px;"><bookmark-button :book="book" /></div>
          </div>

          <div class="authors divider-bottom">
            <author-widget class="mb-2" v-for="person of book.authors" :key="person" :name="person"></author-widget>
            <creators-widget class="mb-2" v-if="book.creators" :creators="book.creators" :linked="true"/>
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

  <BookDetailFooter :book="book" />

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

.prev-next {

  text-align: center;

  @include from($tablet) {
    text-align: right;
  }
}

</style>
