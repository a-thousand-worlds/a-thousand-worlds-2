<script>
import BooksFilter from '../components/BooksFilter.vue'
import BooksView from '../components/BooksView.vue'

export default {
  name: 'HomePage',
  components: { BooksFilter, BooksView }
}

</script>

<template>
  <div>

    <books-view></books-view>

    <teleport to="#books-filter-menu">
      <books-filter></books-filter>
    </teleport>

  </div>
</template>

<style>

</style>
