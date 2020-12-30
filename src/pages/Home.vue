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
    // used to show the one-time welcome messagein App.vue
    if (!this.$store.state.ui.lastVisited) {
      this.$store.commit('ui/setLastVisited', new Date())
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
