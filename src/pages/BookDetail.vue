<script>
import LazyImage from '@/components/LazyImage'
import AuthorWidget from '@/components/AuthorWidget'
import BookmarkButton from '@/components/BookmarkButton'
import BooksFilter from '@/components/BooksFilter'
import Clipboard from 'clipboard'

export default {
  name: 'BookDetail',
  components: {
    AuthorWidget,
    BookmarkButton,
    BooksFilter,
    LazyImage,
  },
  data() {
    return {
      book: null,
      pageUrl: window.location.href,
    }
  },
  created() {
    const id = this.$router.currentRoute._value.params.id
    this.book = this.$store.state.booksIndex[id]
    window.scrollTo(0, 0)
  },
  watch: {
    '$route'(next) {
      const id = this.$router.currentRoute._value.params.id
      this.book = this.$store.state.booksIndex[id]
      window.scrollTo(0, 0)
    },
    '$store.state.booksList'(next, prev) {
      const id = this.$router.currentRoute._value.params.id
      if (next && Object.keys(next).length && !next[id]) {
        // book not found! drop to 404
        // timeout to make router finish any his current work, if doing any
        setTimeout(() => {
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push('/404')
        }, 0)
      }
      this.book = this.$store.state.booksIndex[id]
    }
  },
  computed: {
    nextBook() {
      const list = this.$store.state.booksFiltered.map(x => x.id)
      const pos = list.indexOf(this.book.id)
      return list[pos + 1]
    },
    prevBook() {
      const list = this.$store.state.booksFiltered.map(x => x.id)
      const pos = list.indexOf(this.book.id)
      return list[pos - 1]
    }
  },
  mounted() {
    new Clipboard('#copy-link') // eslint-disable-line no-new
  }
}

</script>

<template>

  <teleport to="#books-filter-menu">
    <books-filter></books-filter>
  </teleport>

  <div v-if="book" class="mx-5">

    <div class="columns">
      <div class="column mr-1 is-two-fifths" style="max-width: 720px">
        <div class="mb-5">
          <router-link :to="{ name: 'Home' }" class="directory-nav-link is-uppercase">&lt; Back to Books</router-link>
        </div>
        <div class="book-cover-wrapper">
          <lazy-image class="cover" :src="book.cover"/>
        </div>
      </div>

      <div class="column" style="max-width: 720px;">

        <div class="is-flex is-justify-content-flex-end">
          <div class="mb-5">
            <router-link v-if="prevBook" :to="{ name: 'BookDetail', params: {id: prevBook} }" class="directory-nav-link is-uppercase mx-6">&lt; Previous Book</router-link>
            <router-link v-if="nextBook" :to="{ name: 'BookDetail', params: {id: nextBook}  }" class="directory-nav-link is-uppercase">Next Book &gt;</router-link>
          </div>
        </div>

        <div class="title-container divider-bottom is-flex is-justify-content-space-between">
          <h1 class="title">{{book.title}}</h1>
          <div style="padding-top: 0px;"><bookmark-button :book="book" /></div>
        </div>

        <div class="authors divider-bottom">
          <div v-for="person of book.authors" :key="person" class="mb-2">
            <author-widget :name="person"></author-widget>
          </div>
        </div>

        <p style="font-size: 22px;">{{book.description}}</p>

      </div>

    </div>

  </div>

  <!-- Add a bottom spacer so that fixed position footer clears content when scrolled to the bottom. -->
  <div class="mb-7" />

  <div class="content-footer">
    <div class="content-footer-inner">
      <div class="from-fullhd">
        <input type="text" class="input" style="width: 16rem;" :value="pageUrl" readonly />
        <button id="copy-link" class="button is-rounded mx-1" :data-clipboard-text="pageUrl">COPY LINK</button>
      </div>
      <div>
        <button class="button button-unstyled">FIND BOOK AT</button>
        <button class="button is-rounded mx-1">LOCAL LIBRARY</button>
        <button class="button is-rounded mx-1">LINK</button>
        <button class="button is-rounded mx-1">INDIEBOUND</button>
      </div>
    </div>
  </div>

</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/vars.scss';

.directory-nav-link {
  color: black;
}

.title {
  font-size: 50px;
  line-height: 1;
  margin-bottom: 0;
}

.authors {
  font-size: 14px;
}

.content-footer {
  position: fixed;
  bottom: 0;
  background-color: #ddd;
  width: calc(100% - #{$leftbar-width} - #{$rightbar-width} + 0.75rem);
  padding: 10px 20px;
  white-space: nowrap;

  @include until($tablet) {
    left: 0;
    width: 100%;
    // make space for mobile-bottom-nav
    bottom: 94px;
  }

  .button, input {
    border: solid 1px #666;
  }
}

.content-footer-inner {
  display: flex;
  justify-content: center;

  @include from($fullhd) {
    justify-content: space-between;
    margin-left: 60px;
    margin-right: 60px;
  }
}

/* Unstyled button for text that needs to sit next to a button and have the same size and padding. */
.button-unstyled {
  cursor: default;
  background-color: transparent;
  border-color: transparent !important;
}

</style>
