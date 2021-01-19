<script>
import * as slugify from '@sindresorhus/slugify'

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
          name: slugify(this.person.name)
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
