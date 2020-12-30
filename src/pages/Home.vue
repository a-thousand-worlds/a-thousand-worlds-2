<script>
import BooksFilter from '../components/BooksFilter.vue'
import BooksView from '../components/BooksView.vue'

export default {
  name: 'HomePage',
  components: {
    BooksFilter,
    BooksView,
  },
  data() {
    return {
      lastVisited: localStorage.getItem('lastVisited')
    }
  },
  beforeRouteLeave(to, from, next) {
    // mark the user's visit once they navigate to any other page
    // works with showHero in App.vue
    if (!this.lastVisited) {
      this.lastVisited = new Date()
      localStorage.setItem('lastVisited', this.lastVisited)
    }
    next()
  }
}

</script>

<template>

  <BooksView />

  <teleport to="#books-filter-menu">
    <BooksFilter />
  </teleport>

</template>
