<script>
import AuthorWidget from '@/components/AuthorWidget'
import BookmarkButton from '@/components/BookmarkButton'

export default {
  props: ['book'],
  components: {
    'author-widget': AuthorWidget,
    'bookmark-button': BookmarkButton
  }
}
</script>

<template>
  <div class="book-cover-wrapper">
    <img class="cover" :src="book.cover"/>
    <div class="cover-shadow"></div>
    <router-link :to="{name:'Home',params:{bid:book.id}}" class="cover-data">
      <div class="title">{{book.title}}</div>
      <div class="authors">
        <div v-for="person of book.authors" :key="person">
          <author-widget :name="person"></author-widget>
        </div>
      </div>
      <div class="bmb">
        <bookmark-button :book="book"></bookmark-button>
      </div>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/vars.scss';

.book-cover-wrapper {
  position: relative;

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
    border: 10px solid $atw-base;
    padding: 20px;
    opacity: 1;
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
