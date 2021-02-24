<script>

import CreatorsWidget from '@/components/CreatorsWidget'
import BookmarkButton from '@/components/BookmarkButton'
import BookDetailLink from '@/components/BookDetailLink'

export default {
  components: {
    CreatorsWidget,
    BookmarkButton,
    BookDetailLink,
  },
  props: {
    book: {},
    // link to admin edit pages instead of public detail pages
    edit: Boolean,
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
  },
  created() {
    // this.$store.dispatch('loadImage', this.book.cover)
  }
}
</script>

<template>
  <!-- doing v-if check because this component used for bookmarks bar also, and it may happen, that bookmarked (by some user) book may be removed from database (by admin), so book to display will be undefined -->
  <div v-if="book" class="columns m-0">
    <div class="column is-one-half p-0 mb-20">
      <BookDetailLink :book="book" :edit="edit" class="cover-data">
        <div class="img-cover bg-secondary" :style="{ width: '100%', minWidth: '100px', paddingTop: coverRatio+'%', backgroundImage: `url(${bgImage})`, backgroundSize: 'contain' }" />
      </BookDetailLink>
    </div>
    <div class="column is-one-half is-align-content-center p-0">
      <div class="columns is-mobile is-vcentered m-0" style="line-height: 1.25;">

        <div class="column p-0 pl-20 pr-10">

          <div class="is-flex is-justify-content-space-between mb-20">
            <div>
              <BookDetailLink :book="book" class="cover-data" :edit="edit">
                <h3 class="link mb-10" style="margin-right: 15px;">{{ book.title }}</h3>
              </BookDetailLink>
              <div class="authors">
                <CreatorsWidget :book="book" linked :edit="edit" />
              </div>
            </div>

            <BookmarkButton :book="book" iconStyle="margin-top: 6.5px; height: 27px;" />

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/style/mixins.scss';

.link {
  color: black;
  &:hover {
    @include primary(color);
  }
}

.is-vcentered {
  height: 100%;
}
</style>
