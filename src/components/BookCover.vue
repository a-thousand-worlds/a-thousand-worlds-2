<script>
export default {
  props: ['book']
}
</script>

<template>
  <div class="book-cover-wrapper">
    <img class="cover" :src="book.cover"/>
    <div class="cover-shadow"></div>
    <router-link :to="{name:'Home',params:{bid:book.id}}" class="cover-data">
      <div class="title">{{book.title}}</div>
      <div class="authors">
        <div class="author">{{book.authors}}</div>
      </div>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/vars.scss';

.book-cover-wrapper {
  position: relative;

  .cover-shadow, .cover-data {
    transition: opacity 2s ease-in-out;
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
      transition: opacity 2s ease-in-out;
    }
  }
}

</style>
