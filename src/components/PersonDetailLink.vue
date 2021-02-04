<script>
import * as slugify from '@sindresorhus/slugify'

/** A helper component to generate a PersonDetail route with the supplementary slug. */
export default {
  props: {
    person: {
      required: true,
    },
    // if true, links to BookEdit
    edit: Boolean,
  },
  computed: {
    route() {
      if (!this.person.name) return { name: 'People' }
      return {
        name: this.edit ? 'PersonEdit' : 'PersonDetail',
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
