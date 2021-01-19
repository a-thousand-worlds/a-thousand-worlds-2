<script>
import * as slugify from '@sindresorhus/slugify'

/** A helper component to generate a BookDetail route with the supplementary slug. */
export default {
  props: {
    book: {
      required: true,
    },
  },
  computed: {
    route() {
      return {
        name: 'BookDetail',
        params: {
          isbn: this.book.isbn,
          slug: slugify(this.book.title.replace(/'/g, ''))
        }
      }
    }
  },
}

</script>

<template>
  <router-link :to="route">
    <slot />
  </router-link>
</template>
