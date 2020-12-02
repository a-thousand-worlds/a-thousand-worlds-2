<script>

export default {
  name: 'BookDetail',
  computed: {
    book() {
      const id = this.$router.currentRoute._value.params.id
      return this.$store.state.books[id] || {}
    }
  }
}

</script>

<template>

  <div class="navbar-horizontal">
    <router-link :to="{ name: 'Home' }">&lt; Back to Books</router-link>
  </div>

  <div class="columns">
    <div class="left-column">
      <div class="book-cover-wrapper">
        <img class="cover" :src="book.cover"/>
      </div>
    </div>

    <div class="right-column">
      <h1 class="title">{{book.title}}</h1>
    </div>
  </div>

</template>

<style lang="scss" scoped>
@import '@/assets/vars.scss';

.columns {
  display: flex;
}

.left-column {
  max-width: 40%;
}

</style>
