<script>
export default {

  props: {
    person: {
      required: true,
    },
  },

  computed: {
    books() {
      return this.$store.getters['books/list']().filter(book =>
        (book.authors || []).includes(this.person.name) ||
        (book.illustrators || []).includes(this.person.name) ||
        Object.keys(book.creators || {}).includes(this.person.id)
      )
    },
  },

  methods: {
    async remove() {
      if (this.books.length > 0) return

      this.$store.commit('ui/setBusy', true)
      try {
        await this.$store.dispatch('people/remove', this.person.id)
        await this.$store.dispatch('ui/popup', `${this.person.name} deleted`)
      }
      finally {
        this.$store.commit('ui/setBusy', false)
      }
    },
  }

}
</script>

<template>
  <button
    :disabled="$uiBusy && books.length > 0"
    @click.prevent="remove"
    v-tippy="{ content: books.length > 0 ? `${person.name} has ${books.length} book${books.length === 1 ? '' : 's'} and may not be deleted. If all of their books are deleted, then they can be deleted.` : `${person.name} has no books and may be deleted` }"
    class="button is-flat"
    :style="{
      opacity: books.length > 0 ? 0.2 : null,
      cursor: books.length > 0 ? 'default' : 'pointer'
    }
    ">
    <i class="fas fa-times" />
  </button>
</template>
