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
  }
}

</script>

<template>

  <BooksView />

  <teleport to="#books-filter-menu">
    <Filter type="books" />
  </teleport>

</template>
