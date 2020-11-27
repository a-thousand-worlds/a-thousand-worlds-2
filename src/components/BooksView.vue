<script>
export default {
  computed: {
    books() {
      return Object.keys(this.$store.state.books)
        .map(x => this.$store.state.books[x])
        .filter(x => typeof x.id === 'string' && x.id.length > 8)
    }
  }
}
</script>

<template>
  <div class="masonry">
    <div class="masonry-item" v-for="book of books" :key="book.id">
      <img class="cover" :src="book.cover"/>
    </div>
  </div>
</template>

<style lang="css" scoped>
@media only screen and (max-width: 480px) {
  .masonry {
    column-count: 1;
  }
}
@media only screen and (min-width: 481px) and (max-width: 780px) {
  .masonry {
    column-count: 2;
  }
}
@media only screen and (min-width: 781px) {
  .masonry {
    column-count: 3;
  }
}

.masonry-item {
  margin-bottom: 30px;
}

img.coveraa {
  max-width: 420px;

}
</style>
