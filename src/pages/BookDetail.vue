<script>
import BookDetailFooter from '@/components/BookDetailFooter'
import BookmarkButton from '@/components/BookmarkButton'
import Filter from '@/components/Filter'
import Clipboard from 'clipboard'
import CreatorsWidget from '@/components/CreatorsWidget'
import LazyImage from '@/components/LazyImage'
import Loader from '@/components/Loader'
import NotFound from '@/pages/NotFound'
import PrevNext from '@/components/PrevNext'
import Tag from '@/components/Tag'

export default {
  name: 'BookDetail',
  components: {
    BookDetailFooter,
    BookmarkButton,
    Filter,
    CreatorsWidget,
    LazyImage,
    Loader,
    NotFound,
    PrevNext,
    Tag,
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
    tags() {
      const bookTags = this.$store.state.tags.books.data || {}
      return Object.keys(this.book?.tags || [])
        .map(id => bookTags[id])
        .filter(x => x)
    }
  },
  mounted() {
    new Clipboard('#copy-link') // eslint-disable-line no-new
  },
}

</script>

<template>

  <teleport to="#books-filter-menu">
    <Filter type="books" />
  </teleport>

  <div class="book-detail">

    <div class="columns mb-5">

      <div class="column is-narrow">
        <router-link :to="{ name: 'Home' }" class="is-uppercase is-primary">&lt; Back to Books</router-link>
      </div>

      <PrevNext v-if="book" type="books" :item="book" class="column" />
    </div>

    <div class="columns">

      <div class="column mr-0 is-two-fifths">
        <div v-if="book">
          <div class="book-cover-wrappertext-centered mb-20">
            <LazyImage class="cover" :src="book.cover" />
          </div>
          <div class="tags">
            <Tag v-for="tag of tags" :key="tag.id" :tag="tag" type="books" />
          </div>
        </div>
      </div>

      <div class="column">

        <div v-if="!$store.state.books.loaded" class="my-50">
          <Loader />
        </div>
        <div v-else-if="book">
          <div class="title-container divider-bottom is-flex is-justify-content-space-between">
            <h1 class="title">{{ book.title }}</h1>
            <div style="padding-top: 0px;"><BookmarkButton :book="book" /></div>
          </div>

          <div class="authors divider-bottom">
            <CreatorsWidget v-if="book.creators" class="mb-2" :creators="book.creators" :linked="true" />
          </div>

          <!-- summary/description is edited with ckeditor and may contain html -->
          <p class="summary" :innerHTML="book.summary || book.description" />

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
@import '@/assets/style/vars.scss';

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
  @include from($widescreen) {
    font-size: 22px;
  }
}

</style>
