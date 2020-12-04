<script>
import AuthorWidget from '@/components/AuthorWidget'
import BookmarkButton from '@/components/BookmarkButton'

export default {
  props: ['book'],
  components: {
    'author-widget': AuthorWidget,
    'bookmark-button': BookmarkButton
  },
  methods: {
    coverRatio() {
      if (!this.book || !this.book.coverWidth || !this.book.coverHeight) {
        return 1
      }
      return this.book.coverHeight / this.book.coverWidth * 100
    },
    // can generate randomly, or use some predefined list
    genBack() {
      const chars = '0123456789abcdef'
      let ret = '#'
      // eslint-disable-next-line fp/no-loops
      for (let i = 0; i < 6; i++) {
        ret += chars[Math.floor(Math.random() * 16)]
      }
      return ret
    }
  }
}
</script>

<template>
  <router-link :to="{name: 'BookDetail',params:{id:book.id}}">
    <div :style="{width: '100%', paddingTop: coverRatio()+'%', backgroundColor: genBack(), backgroundImage: 'url('+book.cover+')', backgroundSize: 'contain'}" class="book-cover-wrapper">
      <div class="cover-shadow"></div>
      <div class="cover-data">
        <div class="title">{{book.title}}</div>
        <div class="authors">
          <div v-for="person of book.authors" :key="person">
            <author-widget :name="person"></author-widget>
          </div>
        </div>
        <div class="bmb">
          <bookmark-button :book="book"></bookmark-button>
        </div>
      </div>
    </div>
  </router-link>
</template>

<style lang="scss" scoped>
@import '@/assets/vars.scss';

.book-cover-wrapper {
  position: relative;
  top: 0;
  left: 0;
  margin-bottom: 10px;
  background-size: contain;

  .cover-image {
    position: absolute;
    top: 0;
    left: 0;
    .cover {
      // https://www.tutorialrepublic.com/faq/how-to-remove-white-space-under-an-image-using-css.php#:~:text=Answer%3A%20Use%20the%20CSS%20display,to%20adjust%20other%20inline%20elements.
      display: block;
    }
  }

  .cover-shadow, .cover-data {
    transition: transform 2s ease-in-out 0s;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    opacity: 0;
  }

  .cover-data {
    padding: 20px;
    opacity: 1;

    .title {
      font-size: 24px;
    }
  }

  .cover-shadow {
    background: #fff;
    opacity: 0.8;
  }

  &:hover {
    .cover-shadow, .cover-data {
      display: block;
      transition: transform 2s ease-in-out 0s;
    }
  }
  .bmb {
    position: absolute;
    bottom: 10px;
    right: 10px;
  }
}

</style>
