<script>
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'

import { isbnSearch } from '@/utils'
import AuthorWidget from '@/components/AuthorWidget'

export default {
  components: {
    AuthorWidget
  },
  props: ['modelValue', 'disabled', 'searchDb', 'searchOnStart'],
  emits: ['update:modelValue', 'book-selected', 'isbn-search-state', 'isbn-search-result'],
  data() {
    return {
      isbn: this.modelValue || '',
      loading: false,
      searches: [],
      ckeditor: BalloonEditor
    }
  },
  methods: {
    searchGlobal() {
      this.loading = true
      this.$emit('isbn-search-state', this.loading)
      isbnSearch(this.isbn)
        .then(book => {
          this.loading = false
          this.$emit('isbn-search-state', this.loading)
          this.$emit('isbn-search-result', book)
        })
        .catch(err => {
          console.log('error', err)
          this.loading = false
          this.$emit('isbn-search-state', this.loading)
          this.$emit('isbn-search-result', null)
        })
    },
    doSearch(e) {
      if (!this.searchDb) {
        return
      }
      const search = e.target.value.toLowerCase()
      this.isbn = search
      this.$emit('update:modelValue', search)
      this.book = null
      this.searches = this.$store.state.booksList
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
    },
    onEnter() {
      console.log('on enter')
    }
  },
  watch: {
    modelValue(next, prev) {
      this.isbn = next
    }
  },
}
</script>

<template>

<div class="control">
  <div class="field is-grouped">
    <div class="control">
      <button @click="searchGlobal()" :disabled="disabled || loading || !isbn.length" :class="{'is-loading': loading}" class="is-flat">
        <i class="fas fa-search"></i>
      </button>
    </div>
    <div class="control">
      <ckeditor class="oneline" @keyup.enter.prevent.stop="onEnter" v-model="isbn" :editor="ckeditor" @input="doSearch"/>
      <div v-click-outside="hideSearch" v-if="searches.length" class="search-wrap">
        <div class="search-results">
          <div @click.prevent="fillBook(res, si)" class="media p-2" v-for="res of searches" :key="res.id">
            <div class="media-left">
              <img :src="res.cover">
            </div>
            <div class="media-right">
              <b>{{res.title}}</b><br>
              <small>{{res.isbn}}</small><br>
              <author-widget :nolink="true" :name="res.authors[0]"></author-widget>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

</template>

<style lang="scss" scoped>

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
    z-index: 5;
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
