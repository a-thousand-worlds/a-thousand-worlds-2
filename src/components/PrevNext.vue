<script>
import BookDetailRoute from '@/components/BookDetailRoute'

export default {
  components: {
    BookDetailRoute,
  },
  props: {
    book: {
      required: true
    },
  },
  computed: {
    nextBook() {
      const list = this.$store.getters['books/filtered']
      const pos = list.map(x => x.id).indexOf(this.book?.id)
      return list[pos + 1]
    },
    prevBook() {
      const list = this.$store.getters['books/filtered']
      const pos = list.map(x => x.id).indexOf(this.book?.id)
      return list[pos - 1]
    }
  }
}

</script>

<template>
  <div class="prev-next">
    <BookDetailRoute v-if="prevBook" :book="prevBook" class="is-uppercase is-primary mr-6" style="white-space: nowrap;">&lt; Previous Book</BookDetailRoute>
    <!-- separating character needed otherwise the two links do not wrap -->
    <span style="visibility: hidden;"> | </span>
    <BookDetailRoute v-if="nextBook" :book="nextBook" class="is-uppercase is-primary" style="white-space: nowrap;">Next Book &gt;</BookDetailRoute>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

.prev-next {

  text-align: center;

  @include from($tablet) {
    text-align: right;
  }
}

</style>
