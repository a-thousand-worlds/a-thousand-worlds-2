<script>

import AuthorWidget from '@/components/AuthorWidget'

export default {
  props: ['inputId', 'modelValue', 'disabled', 'searchable'],
  emits: ['update:modelValue', 'bookSelected'],
  data() {
    return {
      title: this.modelValue || '',
      searches: []
    }
  },
  methods: {
    doSearch(e) {
      const search = e.target.value
      this.$emit('update:modelValue', search)
      if (!this.searchable) {
        return
      }
      this.book = null
      this.searches = this.$store.state.booksList
        .filter(book => search && book.title.toLowerCase().includes(search.toLowerCase()))
    },
    hideSearch() {
      this.searches = []
    },
    fillBook(b) {
      this.hideSearch()
      this.title = b.title
      this.$emit('update:modelValue', this.title)
      this.$emit('book-selected', b)
    }
  },
  watch: {
    modelValue(next, prev) {
      this.title = next
    }
  },
  components: {
    'author-widget': AuthorWidget
  }
}
</script>

<template>

<div class="control">
  <input :disabled="disabled" :id="inputId" type="text" class="input" @input="doSearch($event)" v-model="title">
  <div v-click-outside="hideSearch" v-if="searches.length" class="search-wrap">
    <div class="search-results">
      <div @click.prevent="fillBook(res)" class="media p-2" v-for="res of searches" :key="res.id">
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

</template>

<style lang="scss" scoped>

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
