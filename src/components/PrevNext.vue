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
  <div class="prev-next pb-0 mb-10">
    <span v-if="prevBook" style="white-space: nowrap;">
      <BookDetailRoute :book="prevBook" class="is-hidden-tablet button is-rounded is-primary is-uppercase mr-6 mb-10">&lt; Previous Book</BookDetailRoute>
      <BookDetailRoute :book="prevBook" class="is-hidden-mobile is-uppercase is-primary mr-6 mb-10">&lt; Previous Book</BookDetailRoute>
    </span>

    <!-- separating character needed otherwise the two links do not wrap -->
    <span v-if="nextBook" style="visibility: hidden;"> | </span>

    <span v-if="nextBook" style="white-space: nowrap;">
      <BookDetailRoute v-if="nextBook" :book="nextBook" class="is-hidden-tablet button is-rounded is-primary is-uppercase">Next Book &gt;</BookDetailRoute>
      <BookDetailRoute v-if="nextBook" :book="nextBook" class="is-hidden-mobile is-primary is-uppercase">Next Book &gt;</BookDetailRoute>
    </span>
  </div>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";

.prev-next {

  text-align: center;

  @include from($tablet) {
    text-align: right;
  }
}

</style>
