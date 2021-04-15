<script>
import { computed } from 'vue'
import { useHead } from '@vueuse/head'
import sortBy from 'lodash/sortBy'
import Clipboard from 'clipboard'
import store from '@/store'
import router from '@/router'
import BookDetailFooter from '@/components/BookDetailFooter'
import BookmarkButton from '@/components/BookmarkButton'
import Filter from '@/components/Filter'
import CreatorCard from '@/components/CreatorCard'
import LazyImage from '@/components/LazyImage'
import Loader from '@/components/Loader'
import NotFound from '@/pages/NotFound'
import PrevNext from '@/components/PrevNext'
import RecommendedBy from '@/components/RecommendedBy'
import Tag from '@/components/Tag'

export default {
  name: 'BookDetail',
  components: {
    BookDetailFooter,
    BookmarkButton,
    Filter,
    CreatorCard,
    LazyImage,
    Loader,
    NotFound,
    PrevNext,
    RecommendedBy,
    Tag,
  },
  beforeRouteLeave(to, from, next) {
    // mark the user's visit once they navigate to any other page
    // used to show the one-time welcome messagein App.vue
    if (!this.$store.state.ui.lastVisited) {
      this.$store.commit('ui/setLastVisited', new Date())
    }
    next()
  },
  setup() {

    const isbn = router.currentRoute._value.params.isbn

    const titleComputed = computed(() => {
      const book = store.state.books.loaded
        ? Object.values(store.state.books.data).find(book => book.isbn === isbn)
        : null
      return book ? book.title : null
    })

    const imageComputed = computed(() => {
      const book = store.state.books.loaded
        ? Object.values(store.state.books.data).find(book => book.isbn === isbn)
        : null
      const url = book?.cover?.src || book?.cover?.url || book?.cover
      return url || null
    })

    useHead({
      title: titleComputed,
      meta: [
        { name: 'og:image', content: imageComputed },
        { name: 'og:title', content: titleComputed },
        { name: 'twitter:image', content: imageComputed },
        { name: 'twitter:title', content: titleComputed },
      ],
    })

  },
  data() {
    return {
      editOnClick: false,
    }
  },
  computed: {
    book() {
      const book = this.$store.state.books.loaded
        ? Object.values(this.$store.state.books.data).find(book => book.isbn === this.isbn)
        : null
      this.$store.dispatch('debug', { book })
      return book
    },
    // creators id array sorted by authors then illustrators
    creators() {
      if (!this.book || !this.book.creators) return []
      return sortBy(Object.keys(this.book.creators), id => this.book.creators[id])
    },
    editUrl() {
      const url = window.location.href
      return url.replace(/\/$/, '') + '/edit'
    },
    isbn() {
      return this.$route.params.isbn
    },
    tags() {
      const bookTags = this.$store.state.tags.books.data || {}
      return Object.keys(this.book?.tags || [])
        .map(id => bookTags[id])
        .filter(x => x)
    },
  },
  created() {
    window.addEventListener('keydown', this.keydown)
    window.addEventListener('keyup', this.keyup)
  },
  mounted() {
    new Clipboard('#copy-link') // eslint-disable-line no-new
  },
  unmounted() {
    window.removeEventListener('keydown', this.keydown)
    window.removeEventListener('keyup', this.keyup)
  },
  methods: {
    adminEditClick(e) {
      // use e.shiftKey instead of editOnClick in case shift key is held down from previous page
      if (!this.$iam('owner') || !e.shiftKey) return
      this.$router.push({ name: 'BookEdit', params: this.$route.params })
    },
    keydown(e) {
      if (this.$iam('owner') && e.key === 'Shift') {
        this.editOnClick = true
      }
    },
    keyup(e) {
      if (this.$iam('owner') && e.key === 'Shift') {
        this.editOnClick = false
      }
    },
  },
}

</script>

<template>

  <teleport to="#books-filter-menu">
    <Filter type="books" />
  </teleport>

  <div class="book-detail" :data-book-id="book?.id">

    <div class="columns mb-5">

      <div class="column is-narrow">
        <a @click.prevent="$router.back" class="is-uppercase is-primary">&lt; Back</a>
      </div>

      <PrevNext v-if="book" type="books" :item="book" class="column" />
    </div>

    <div class="columns">

      <div class="column column1 mr-0 is-two-fifths">
        <div v-if="book">
          <div class="book-cover-wrapper text-centered mb-20">
            <a @click.prevent="adminEditClick" :style="{ cursor: editOnClick ? 'context-menu' : 'default' }"><LazyImage class="cover" :src="book.cover" /></a>
          </div>
          <div class="tags">
            <Tag v-for="tag of tags" :key="tag.id" :tag="tag" type="books" button-class="is-outlined" />
          </div>
        </div>
      </div>

      <div class="column">

        <div v-if="!$store.state.books.loaded" class="my-50">
          <Loader />
        </div>
        <div v-else-if="book">
          <div class="title-container divider-bottom is-flex is-justify-content-space-between">
            <h1 class="title">
              <a @click.prevent="adminEditClick" style="color: inherit;" :style="{ cursor: editOnClick ? 'context-menu' : 'default', 'user-select': editOnClick ? 'none' : null }">{{ book.title }}</a>
            </h1>
            <!-- set padding-top and height so that the icon lines up with the top of the title text and the bottom of its baseline -->
            <BookmarkButton :book="book" iconStyle="margin-top: 6.5px; height: 27px;" />
          </div>

          <!-- use negative right margin to avoid wrapping creators until margin is used up -->
          <div class="creators divider-bottom">
            <div class=" is-flex is-flex-wrap-wrap" style="margin-right: -30px;">
              <CreatorCard v-for="id in creators" :key="id" :id="id" :role="book.creators[id]" class="mb-20 mr-30" style="min-width: 33%;" />
            </div>
          </div>

          <!-- summary is edited with ckeditor and may contain html -->
          <p class="summary" :innerHTML="book.summary || book.description" />

          <RecommendedBy v-if="book.createdBy" v-model="book.createdBy" class="mt-10" style="font-size: 16px;" />

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
  @include from($tablet) {
    margin: 0 30px;
  }
  @include from($desktop) {
    margin: 0 60px;
  }
}

.column1 {
  text-align: center;
  @include from($tablet) {
    text-align: left;
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

.creators {
  font-size: 14px;
}

.summary {
  font-size: 16px;
  line-height: 1.75;
}

</style>
