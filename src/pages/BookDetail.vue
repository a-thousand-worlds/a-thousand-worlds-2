<script>
import Clipboard from 'clipboard'
import LazyImage from '@/components/LazyImage'
import AuthorWidget from '@/components/AuthorWidget'
import CreatorsWidget from '@/components/CreatorsWidget'
import BookmarkButton from '@/components/BookmarkButton'
import BookDetailRoute from '@/components/BookDetailRoute'
import BooksFilter from '@/components/BooksFilter'
import NotFound from '@/pages/NotFound'

export default {
  name: 'BookDetail',
  components: {
    AuthorWidget,
    CreatorsWidget,
    BookmarkButton,
    BookDetailRoute,
    BooksFilter,
    LazyImage,
    NotFound,
  },
  data() {
    return {
      isbn: this.$router.currentRoute._value.params.isbn,
      pageUrl: window.location.href,
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
      this.pageUrl = window.location.href
    }
  },
}

</script>

<template>

  <teleport to="#books-filter-menu">
    <books-filter></books-filter>
  </teleport>

  <div class="book-detail">

    <div class="columns">
      <div class="column mr-1 is-two-fifths" style="max-width: 720px">
        <div class="mb-5">
          <router-link :to="{ name: 'Home' }" class="is-uppercase is-primary">&lt; Back to Books</router-link>
        </div>
        <div v-if="book" class="book-cover-wrapper">
          <lazy-image class="cover" :src="book.cover" />
        </div>
      </div>

      <div class="column" style="max-width: 720px;">

        <div class="is-flex is-justify-content-flex-end">
          <div class="mb-5">
            <BookDetailRoute v-if="prevBook" :book="prevBook" class="is-uppercase is-primary mx-6">&lt; Previous Book</BookDetailRoute>
            <BookDetailRoute v-if="nextBook" :book="nextBook" class="is-uppercase is-primary">Next Book &gt;</BookDetailRoute>
          </div>
        </div>

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

  <div v-if="book" class="content-footer">
    <div class="content-footer-inner">
      <div class="from-fullhd">
        <input type="text" class="input" style="width: 16rem;" :value="pageUrl" readonly />
        <button id="copy-link" class="button is-rounded is-secondary mx-10" :data-clipboard-text="pageUrl">COPY LINK</button>
      </div>
      <div>
        <button class="button button-unstyled is-primary">FIND BOOK AT</button>
        <button class="button is-rounded is-secondary mx-1">LOCAL LIBRARY</button>
        <button class="button is-rounded is-secondary mx-1">LINK</button>
        <a :href="`http://www.indiebound.org/book/${book.isbn}?aff=athousandworlds`" target="_blank"><button class="button is-rounded is-secondary mx-1">INDIEBOUND</button></a>
      </div>
    </div>
  </div>

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

.content-footer {
  position: fixed;
  bottom: 0;
  color: $primary-invert;
  background-color: $primary;
  width: calc(100% - #{$leftbar-width} - #{$rightbar-width});
  padding: 10px 20px;
  white-space: nowrap;
  overflow: auto;

  @include until($tablet) {
    left: 0;
    width: 100%;
    padding-bottom: $mobile-footer-height + 9px;
  }

  .button, input {
    border: solid 1px #666;
  }
}

.content-footer-inner {
  display: flex;
  justify-content: center;
  margin-left: 60px;
  margin-right: 60px;

  @include from($fullhd) {
    justify-content: space-between;
  }
}

</style>
