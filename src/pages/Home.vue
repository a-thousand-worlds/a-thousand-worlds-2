<script>
import BooksView from '../components/BooksView.vue'
import Filter from '../components/Filter.vue'

export default {
  name: 'HomePage',
  components: {
    BooksView,
    Filter,
  },
  beforeRouteLeave(to, from, next) {
    // mark the user's visit once they navigate to any other page
    // used to show the one-time welcome messagein App.vue
    if (!this.$store.state.ui.lastVisited) {
      this.$store.commit('ui/setLastVisited', new Date())
    }
    next()
  },
  data() {
    return {
      lastVisited: localStorage.getItem('lastVisited')
    }
  },
  computed: {
    bookTags() {
      return this.$store.state.tags.books.data
    }
  },
  watch: {
    bookTags(next, prev) {
      // load filters from url when tags/books are first loaded
      if (Object.keys(prev).length === 0 && Object.keys(next).length > 0) {
        this.$store.dispatch('books/setFiltersFromUrl', 'books')
      }
    }
  }
}

</script>

<template>

  <teleport to="#books-filter-menu">
    <Filter type="books" />
  </teleport>

  <BooksView />

</template>
