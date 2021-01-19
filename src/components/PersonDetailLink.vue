<script>
// import * as slugify from '@sindresorhus/slugify'

/** A helper component to generate a PersonDetail route with the supplementary slug. */
export default {
  props: {
    person: {
      required: true,
    },
  },
  computed: {
    route() {
      return {
        name: 'PersonDetail',
        params: {
          id: this.person.id,
          // slug: slugify(this.book.title.replace(/'/g, ''))
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
