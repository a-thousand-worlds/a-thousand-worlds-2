<script>
import * as slugify from '@sindresorhus/slugify'

/** A helper component to generate a BookDetail route with the supplementary slug. */
export default {
  props: ['book'],
  computed: {
    route() {
      const slug = slugify(this.book.title.replace(/['’]|%\d\d/g, ''))
      return {
        name: 'BookDetail',
        params: {
          isbn: this.book.isbn,
          slug: slug
            ? slug + '-'
            : ''
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
