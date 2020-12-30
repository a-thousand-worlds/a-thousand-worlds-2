<script>

import { metadataByISBN } from '@/utils'
import AuthorWidget from '@/components/AuthorWidget'

// const isValidIsbn = code => typeof code === 'string' && (code.length === 10 || code.length === 13)

export default {
  props: ['modelValue', 'disabled', 'searchable'],
  emits: ['update:modelValue', 'bookSelected', 'isbnSearchState', 'isbnSearchResult'],
  data() {
    return {
      isbn: this.modelValue || '',
      loading: false,
      searches: []
    }
  },
  methods: {
    searchGlobal() {
      this.loading = true
      this.$emit('isbn-search-state', this.loading)
      metadataByISBN(this.isbn)
        .then(book => {
          this.loading = false
          this.$emit('isbn-search-state', this.loading)
          this.$emit('isbn-search-result', book)
        })
        .catch(err => {
          console.error('error', err)
          this.loading = false
          this.$emit('isbn-search-state', this.loading)
          this.$emit('isbn-search-result', null)
        })
    },
    doSearch(e) {
      const search = e.target.value
      this.isbn = search
      this.$emit('update:modelValue', search)
      this.book = null
      this.searches = this.$store.getters['books/list']()
        .filter(book => search.length && book.isbn.includes(search))
    },
    hideSearch() {
      this.searches = []
    },
    fillBook(b) {
      this.hideSearch()
      this.isbn = b.isbn
      this.$emit('update:modelValue', this.isbn)
      this.$emit('book-selected', b)
    }
  },
  watch: {
    modelValue(next, prev) {
      this.isbn = next
    }
  },
  components: {
    'author-widget': AuthorWidget
  }
}
</script>

<template>

<div class="field has-addons">
  <div class="control w-100">
    <input :disabled="disabled" type="text" class="input" @input="doSearch($event)" v-model="isbn">
    <div v-click-outside="hideSearch" v-if="searches.length" class="search-wrap">
      <div class="search-results">
        <div @click.prevent="fillBook(res, si)" class="media p-2" v-for="res of searches" :key="res.id">
          <div class="media-left">
            <img :src="res.cover">
          </div>
          <div class="media-right">
            <b>{{res.title}}</b><br>
            <small>{{res.isbn}}</small><br>
            <author-widget :name="res.authors[0]"></author-widget>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="searchable" class="control">
    <button @click="searchGlobal()" :disabled="disabled || loading || !isbn" :class="{'is-loading': loading}" class="button is-primary">
      <i class="fas fa-search"></i>
      <span class="ml-3">Search</span>
    </button>
  </div>
</div>

</template>

<style lang="scss" scoped>
@import '@/assets/main.scss';

.w-100 {
  width: 100%;
}

.search-wrap {
  position: relative;
  .search-results {
    position: absolute;
    width: 100%;
    max-height: 400px;
    overflow-y: scroll;
    left: 0;
    top: 0;
    z-index: $zField;
    background: #fff;
    border: 1px solid;

    img {
      max-height: 60px;
    }

    .media {
      margin: 0 !important;

      &:hover {
        background: #eee;
      }
    }
  }
}

</style>
