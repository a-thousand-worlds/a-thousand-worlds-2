<script>
import _ from 'lodash'
import dayjs from 'dayjs'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'
import BookDetailLink from '@/components/BookDetailLink'
import Filter from '@/components/Filter'
import Clipboard from 'clipboard'
import CreatorCard from '@/components/CreatorCard'
import LazyImage from '@/components/LazyImage'
import Loader from '@/components/Loader'
import NotFound from '@/pages/NotFound'
import SimpleInput from '@/components/fields/SimpleInput'
import Tag from '@/components/Tag'

const formatDate = d => {
  return dayjs(d).format('M/D/YYYY hh:mm')
}

export default {
  name: 'BookDetail',
  components: {
    BookDetailLink,
    CreatorCard,
    Filter,
    LazyImage,
    Loader,
    NotFound,
    SimpleInput,
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
  data() {
    return {
      ckConfig: {
        toolbar: [],
      },
      tagsDropdownActive: false,
      editor: BalloonEditor,
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
      return _.sortBy(Object.keys(this.book.creators), id => this.book.creators[id])
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
    tagOptions() {
      return this.$store.getters['tags/books/listSorted']()
    },
  },
  mounted() {
    new Clipboard('#copy-link') // eslint-disable-line no-new
  },
  methods: {

    formatDate,

    closeTagsDropdown() {
      this.tagsDropdownActive = false
    },

    saveIsbn(isbn) {

      // save isbn
      this.$store.dispatch('books/update', {
        path: `${this.book.id}`,
        value: {
          isbn,
        },
      })

      // update route since it is based on isbn
      this.$router.replace({
        name: this.$route.name,
        params: {
          isbn,
          slug: this.$route.params.slug,
        },
      })
    },

    updateTitle(creatorId, titleId) {
      // map titleId from creatorTitles to book creator titles
      this.updateBook(`creators`, {
        [creatorId]: titleId === 'author-illustrator' ? 'both' : titleId
      })
    },

    updateBook(field, value) {
      if (value === undefined) {
        value = field
        field = ''
      }
      this.closeTagsDropdown()
      this.$store.dispatch('books/update', {
        path: `${this.book.id}/${field}`,
        value,
      })
    },

  }
}

</script>

<template>

  <teleport to="#books-filter-menu">
    <Filter type="books" />
  </teleport>

  <div class="book-detail" :data-book-id="book?.id">

    <div class="is-flex is-justify-content-space-between mb-3">

      <div class="mb-5 is-narrow">
        <router-link :to="{ name: 'BooksManager' }" class="is-uppercase is-primary">&lt; Back to Books Manager</router-link>
      </div>

      <BookDetailLink v-if="book" :book="book" class="button is-rounded is-primary">View Book</BookDetailLink>

    </div>

    <div class="columns">

      <div class="column mr-0 is-two-fifths">
        <div v-if="book">

          <!-- cover image -->
          <div class="book-cover-wrappertext-centered mb-20">
            <LazyImage class="cover" :src="book.cover" />
          </div>

          <!-- tags -->
          <div class="tags">

            <Tag v-for="tag of tags" :key="tag.id" :tag="tag" type="books" @remove="updateBook('tags', { [tag.id]: null })" button-class="is-outlined" editable />

            <!-- add tag dropdown -->
            <div class="dropdown mt-4 no-user-select" :class="{ 'is-active': tagsDropdownActive }">
              <div id="dropdown-menu" class="dropdown-menu" role="menu">
                <div class="dropdown-content" style="max-height: 19.5em; overflow: scroll;">
                  <a v-for="tag in tagOptions" :key="tag.id" class="dropdown-item is-capitalized" @click.prevent="updateBook('tags', { [tag.id]: true })">
                    {{ tag.tag }}
                  </a>
                </div>
              </div>
            </div>

            <!-- add tag -->
            <Tag :tag="{ tag: 'ADD TAG' }" nolink tagStyle="background-color: #fff; border-color: #000; color: #000 !important; cursor: pointer" v-click-outside="closeTagsDropdown" @click.prevent.stop="tagsDropdownActive = !tagsDropdownActive" />

          </div>

          <div class="my-20">

            <!-- isbn -->
            <div class="is-flex">
              <b class="mr-1">isbn</b>
              <SimpleInput v-if="book" @update:modelValue="saveIsbn" v-model="book.isbn" placeholder="Enter ISBN" />
            </div>

            <!-- year -->
            <div class="is-flex">
              <b class="mr-1">year</b>
              <SimpleInput v-if="book" @update:modelValue="updateBook({ year: $event })" v-model="book.year" placeholder="Enter Year" />
            </div>

            <!-- goodreads -->
            <div class="is-flex">
              <b class="mr-1">goodreads</b>
              <SimpleInput v-if="book" @update:modelValue="updateBook({ goodreads: $event })" v-model="book.goodreads" placeholder="No value" />
            </div>

          </div>

        </div>
      </div>

      <div class="column">

        <div v-if="!$store.state.books.loaded" class="my-50">
          <Loader />
        </div>
        <div v-else-if="book">

          <!-- title -->
          <div class="title-container divider-bottom is-flex is-justify-content-space-between">
            <h1 class="title">
              <SimpleInput @update:modelValue="updateBook({ title: $event })" v-model="book.title" placeholder="Enter Title" unstyled />
            </h1>
          </div>

          <!-- creators -->
          <div class="authors divider-bottom">
            <CreatorCard v-for="id in creators" :key="id" :id="id" :role="book.creators[id]" class="mb-20 mr-30" style="min-width: 33%;" @updateTitle="titleId => updateTitle(id, titleId)" edit />
          </div>

          <!-- summary -->
          <ckeditor @update:modelValue="updateBook({ summary: $event })" v-model="book.summary" :editor="editor" :config="ckConfig" class="summary" style="padding: 0;" />

        </div>
        <div v-else>
          <NotFound />
        </div>

      </div>

    </div>

  </div>

</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/components/dropdown.sass";
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
  font-size: 18px !important;
  @include from($widescreen) {
    font-size: 22px !important;
  }
}

</style>

<style lang="scss">
.summary.ck.ck-editor__editable_inline>:first-child {
  margin-top: -1px;
  margin-left: -1px;
}
</style>
