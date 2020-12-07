<script>
import BooksFilter from '../components/BooksFilter.vue'
import BooksView from '../components/BooksView.vue'

export default {
  name: 'HomePage',
  components: { BooksFilter, BooksView },
  data() {
    return {
      prevRoute: null
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.prevRoute = from
    })
  },
  created() {
    setTimeout(() => {
      if (this.prevRoute && this.prevRoute.name === 'BookDetail') {
        return
      }
      window.scrollTo(0, 0)
    }, 0)
  }
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
