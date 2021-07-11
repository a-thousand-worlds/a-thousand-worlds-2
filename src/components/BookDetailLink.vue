<script>
import * as slugify from '@sindresorhus/slugify'

/** A helper component to generate a BookDetail route with the supplementary slug. */
export default {
  props: {
    book: {
      required: true,
    },
    // if true, links to BookEdit
    edit: {
      type: Boolean,
    },
  },
  data() {
    return {
      editOnClick: false,
    }
  },
  computed: {
    route() {
      return {
        name: this.edit ? 'BookEdit' : 'BookDetail',
        params: {
          isbn: this.book.isbn,
          slug: slugify(this.book.title.replace(/'/g, '')),
        },
      }
    },
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
        ...(this.editOnClick ? { name: 'BookEdit' } : null),
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
