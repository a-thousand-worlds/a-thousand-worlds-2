<script>

import AuthorWidget from '@/components/AuthorWidget'
import BookmarkButton from '@/components/BookmarkButton'

export default {
  props: ['book', 'colorI'],
  components: {
    'author-widget': AuthorWidget,
    'bookmark-button': BookmarkButton
  },
  created() {
    this.$store.dispatch('loadImage', this.book.cover)
  },
  computed: {
    coverRatio() {
      if (!this.book || !this.book.coverWidth || !this.book.coverHeight) {
        return 1
      }
      return this.book.coverHeight / this.book.coverWidth * 100
    },
    // can generate randomly, or use some predefined list
    bgColor() {
      const colors = ['#fefad2', '#98ba93', '#d4c0d6', '#fcf1f5', '#fcebd0', '#f3fef1']
      return colors[parseInt(this.colorI) % colors.length]
    },
    bgImage() {
      return this.$store.state.images[this.book.cover] || ''
    }
  }
}
</script>

<template>
  <div class="book-list-wrapper columns">
    <div class="column is-one-third">
      <router-link :to="{name:'BookDetail',params:{id:book.id}}" class="cover-data">
        <div class="img-cover" :style="{width: '100%', paddingTop: coverRatio+'%', backgroundColor: bgColor, backgroundImage: 'url('+bgImage+')', backgroundSize: 'contain'}"></div>
      </router-link>
    </div>
    <div class="column is-two-thirds is-align-content-center">
      <div class="columns is-mobile is-vcentered">
        <div class="column">
          <router-link :to="{name:'BookDetail',params:{id:book.id}}" class="cover-data">
            <div class="title">{{book.title}}</div>
          </router-link>
          <div class="authors" v-for="person of book.authors" :key="person">
            <author-widget :name="person"/>
          </div>
        </div>
        <div class="column">
          <div class="bmb  has-text-centered">
            <bookmark-button :book="book"></bookmark-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.is-vcentered {
  height: 100%;
}
</style>
