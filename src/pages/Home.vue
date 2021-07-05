<script>
import { useHead } from '@vueuse/head'
import computedFromState from '@/util/computedFromState'
import writtenList from '@/util/writtenList'
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
  setup() {

    const getFilterPhrase = state => {
      const filters = state.books.filters

      // remove "Picture book" and "Board book" from the filters and use them in place of "books"
      const filterNames = filters
        .filter(tag => tag.tag !== 'Picture book' && tag.tag !== 'Board book')
        .map(tag => tag.tag)
      const booksAdjective = filters.find(filter => filter.tag === 'Picture book') ? 'Picture ' :
        filters.find(filter => filter.tag === 'Board book') ? 'Board ' :
        ''

      return `${writtenList(filterNames)} ${booksAdjective}books`
    }

    const getDescription = state => state.books.filters.length > 0
      ? `Read ${getFilterPhrase(state)} at A Thousand Worlds`
      : 'Colorful Reads X Colorful People'
    const getTitle = state => state.books.filters.length > 0
      ? `${getFilterPhrase(state)} @ A Thousand Worlds`
      : 'A Thousand Worlds'

    const descriptionComputed = computedFromState(getDescription)
    const titleComputed = computedFromState(getTitle)

    useHead({
      title: titleComputed,
      meta: [
        { name: 'og:description', content: descriptionComputed },
        { name: 'og:title', content: titleComputed },
        { name: 'twitter:description', content: descriptionComputed },
        { name: 'twitter:title', content: titleComputed },
      ],
    })

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
        this.$store.dispatch('books/setFiltersFromUrl')
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
