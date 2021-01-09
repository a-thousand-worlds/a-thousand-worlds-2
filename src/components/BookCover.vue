<script>
import AuthorWidget from '@/components/AuthorWidget'
import CreatorsWidget from '@/components/CreatorsWidget'
import BookmarkButton from '@/components/BookmarkButton'
import BookDetailRoute from '@/components/BookDetailRoute'

export default {
  components: {
    AuthorWidget,
    CreatorsWidget,
    BookmarkButton,
    BookDetailRoute,
  },
  props: ['book'],
  computed: {
    coverRatio() {
      if (this.updatedCover) return this.book.cover?.height / this.book.cover?.width * 100
      if (!this.book || !this.book.coverWidth || !this.book.coverHeight) {
        return 1
      }
      return this.book.coverHeight / this.book.coverWidth * 100
    },
    bgImage() {
      if (this.updatedCover) return this.book.cover?.url
      // return this.$store.state.images[this.book.cover] || ''
      return this.book.cover || ''
    },
    updatedCover() {
      return this.book.cover?.url?.startsWith('http')
    }
  }
}
</script>

<template>
  <BookDetailRoute :book="book">
    <div :style="{width: '100%', paddingTop: coverRatio+'%', backgroundImage: 'url('+bgImage+')', backgroundSize: 'contain'}" class="book-cover-wrapper bg-secondary">
      <div class="cover-shadow" />
      <div class="cover-data">
        <div class="title">{{ book.title }}</div>
        <div class="authors">
          <AuthorWidget v-for="person of book.authors" :key="person" :name="person" :nolink="true" />
          <CreatorsWidget v-if="book.creators" :creators="book.creators" :linked="true" :nolink="true" />
        </div>
        <div class="bmb">
          <BookmarkButton :book="book" />
        </div>
      </div>
    </div>
    <div class="is-hidden-tablet">

      <div class="divider-bottom is-flex is-justify-content-space-between">
        <div>
          <h1 class="title">{{ book.title }}</h1>
          <div v-for="person of book.authors" :key="person" class="mb-2">
            <AuthorWidget :name="person" />
          </div>
        </div>
        <div style="padding-top: 0px;"><BookmarkButton :book="book" /></div>
      </div>

    </div>
  </BookDetailRoute>
</template>

<style lang="scss" scoped>
@import '@/assets/style/vars.scss';

.book-cover-wrapper {
  position: relative;
  top: 0;
  left: 0;
  margin-bottom: 10px;
  background-size: contain;

  .cover-shadow, .cover-data {
    position: absolute;
    transition: opacity 0.2s ease-in-out;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    //display: none;
    opacity: 0;
  }

  .cover-data {
    padding: 20px;

    .title {
      font-size: 24px;
    }
  }

  .cover-shadow {
    background: #fff;
  }

  &:hover {
    .cover-shadow
    {
      opacity: 0.8;
    }
    .cover-data {
      opacity: 1;
    }
  }

  .bmb {
    position: absolute;
    bottom: 10px;
    right: 10px;
  }
}

</style>
