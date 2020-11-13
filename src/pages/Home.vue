<script>
import BooksFilter from '../components/BooksFilter.vue'

export default {
  name: 'HomePage',
  components: { BooksFilter }
}

</script>

<template>
  <div>

    <h1 class="title">Home</h1>

    <teleport to="#books-filter-menu">
      <books-filter></books-filter>
    </teleport>

  </div>
</template>

<style>

</style>
