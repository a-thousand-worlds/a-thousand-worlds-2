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
  data() {
    return {
      editOnClick: false,
    }
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
  created() {
    window.addEventListener('keydown', this.keydown)
    window.addEventListener('keyup', this.keyup)
  },
  unmounted() {
    window.removeEventListener('keydown', this.keydown)
    window.removeEventListener('keyup', this.keyup)
  },
  methods: {
    // handle admin edit click in dedicated event handler otherwise shift + click will open new window
    onClick(e) {
      this.$router.push({
        ...this.route,
        ...this.editOnClick ? { name: 'PersonEdit' } : null
      })
    },
    keydown(e) {
      if (this.$iam('owner') && e.key === 'Shift') {
        this.editOnClick = true
      }
    },
    keyup(e) {
      if (this.$iam('owner') && e.key === 'Shift') {
        this.editOnClick = false
      }
    },
  },
}

</script>

<template>
  <a @click.prevent="onClick" :style="{ 'user-select': editOnClick ? 'none' : null }">
    <slot />
  </a>
</template>
