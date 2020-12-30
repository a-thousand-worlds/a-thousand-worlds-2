<script>

import AuthorWidget from '@/components/AuthorWidget'
import CreatorsWidget from '@/components/CreatorsWidget'
import BookmarkButton from '@/components/BookmarkButton'
import BookDetailRoute from '@/components/BookDetailRoute'

export default {
  props: ['book'],
  components: {
    AuthorWidget,
    CreatorsWidget,
    BookmarkButton,
    BookDetailRoute,
  },
  created() {
    // this.$store.dispatch('loadImage', this.book.cover)
  },
  computed: {
    coverRatio() {
      if (this.updatedCover) return this.book.cover.height / this.book.cover.width * 100
      if (!this.book || !this.book.coverWidth || !this.book.coverHeight) {
        return 1
      }
      return this.book.coverHeight / this.book.coverWidth * 100
    },
    bgImage() {
      if (this.updatedCover) return this.book.cover.url
      return this.book.cover || ''
    },
    updatedCover() {
      return this.book.cover?.url?.startsWith('http')
    }
  }
}
</script>

<template>
  <div class="columns">
    <div class="column is-one-third is-one-quarter-desktop is-offset-one-quarter-desktop p-0 mb-20">
      <BookDetailRoute :book="book" class="cover-data">
        <div class="img-cover bg-secondary" :style="{width: '100%', paddingTop: coverRatio+'%', backgroundImage: 'url('+bgImage+')', backgroundSize: 'contain'}"></div>
      </BookDetailRoute>
    </div>
    <div class="column is-two-thirds is-one-quarter-desktop is-align-content-center p-0">
      <div class="columns is-mobile is-vcentered m-0" style="line-height: 1.25;">

        <div class="column p-0 pl-20 pr-10">

          <div class="is-flex is-justify-content-space-between mb-20">
            <div>
              <BookDetailRoute :book="book" class="cover-data">
                <h3 class="mb-10" style="color: black; margin-right: 15px;">{{book.title}}</h3>
              </BookDetailRoute>
              <div class="authors">
                <author-widget v-for="person of book.authors" :key="person" :name="person"></author-widget>
                <creators-widget v-if="book.creators" :creators="book.creators" :linked="true"/>
              </div>
            </div>

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
