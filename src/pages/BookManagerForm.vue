<script>

import axios from 'axios'

const FNURL = 'http://localhost:5001/firebase-test-294020/us-central1/searchISBN?isbn='

export default {
  data() {
    return {
      mode: 'new',
      searching: false,
      found: false,
      book: {
        title: '',
        isbn: '',
        text: '',
        gr: null
      }
    }
  },
  methods: {
    searchISBN() {
      console.log('search', this.book.isbn)
      this.searching = true
      axios.get(FNURL + this.book.isbn).then(res => {
        this.searching = false
        if (res) {
          console.log('found book!', res)
          const inf = res.data
          if (inf && inf.found) {
            this.book.title = inf.gr.title
            this.$refs.coverImg.src = 'data:image/png;base64, ' + inf.gr.coverb
            this.book.gs = inf.gr
          }
        }
      }).catch(err => {
        console.log('search book error', err)
        this.searching = false
      })
    }
  }
}
</script>

<template>
<h1 class="title page-title">Add Book</h1>

<section class="section">
  <form class="w-100" @submit.prevent="searchISBN()">
    <div class="field has-addons">
      <p class="control">
        <a class="button is-static">Search by ISBN</a>
      </p>
      <p class="control w-100">
        <input type="text" :disabled="searching" class="input" placeholder="Enter Book ISBN" v-model="book.isbn"/>
      </p>
      <p class="control">
        <button type="submit" :disabled="searching" class="button is-primary" :class="{'is-loading':searching}">
          <i class="fas fa-search mr-2"></i>
          <span>Search</span>
        </button>
      </p>
    </div>
  </form>
</section>

<section class="section">
  <div class="columns">
    <div class="column column-25">
      <img ref="coverImg"/>
    </div>
    <div class="column column-75">
      <div class="field">
        <label class="label">Book Title</label>
        <div class="control">
          <input type="text" class="input" v-model="book.title">
        </div>
      </div>
    </div>
  </div>
</section>

</template>

<style scoped lang="scss">
#iff-isbn {
  width: 0px !important;
  height: 0px !important;
}
</style>
