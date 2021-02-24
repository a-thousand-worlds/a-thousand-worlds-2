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
  <BookDetailLink :book="book">

    <div :style="{
      width: '100%',
      paddingTop: coverRatio+'%',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'contain'
    }" class="book-cover-wrapper bg-secondary">
      <div class="cover-shadow" />
      <div class="cover-data">
        <div class="title">{{ book.title }}</div>
        <div class="authors">
          <CreatorsWidget :book="book" />
        </div>
      </div>
      <div class="bookmark">
        <BookmarkButton :book="book" />
      </div>
    </div>

    <div class="is-hidden-tablet">
      <div class="divider-bottom is-flex is-justify-content-space-between">
        <div>
          <h1 class="title">{{ book.title }}</h1>
          <CreatorsWidget :book="book" />
        </div>
        <div style="padding-top: 0px;"><BookmarkButton :book="book" /></div>
      </div>
    </div>

  </BookDetailLink>
</template>

<style lang="scss" scoped>
@import '@/assets/style/vars.scss';

.book-cover-wrapper {
  position: relative;
  top: 0;
  left: 0;
  margin-bottom: 10px;
  background-size: contain;

  .cover-shadow, .cover-data, .bookmark {
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  .cover-shadow, .cover-data {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .cover-data {
    // set padding-bottom to 0 so that scrolling overflow content is flush with the bottom of the cover image
    padding: 20px 20px 0 20px;
    overflow: scroll;

    .title {
      font-size: 24px;
      font-weight: 500;
    }
  }

  .cover-shadow {
    background: #fff;
  }

  &:hover {
    .bookmark { opacity: 1; }
    .cover-shadow { opacity: 0.8; }
    .cover-data { opacity: 1; }
  }

  .bookmark {
    position: absolute;
    bottom: 10px;
    right: 10px;
  }
}

</style>
