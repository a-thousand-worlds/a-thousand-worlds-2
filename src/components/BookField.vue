<script>

export default {
  props: ['bookID'],
  emits: ['changed'],
  data() {
    return {
      book: null,
      search: '',
      id: this.bookID || ''
    }
  },
  created() {
    const b = this.$store.state.books[this.id]
    if (b) {
      this.book = b
      this.id = b.id
    }
    else {
      this.book = null
      this.id = ''
    }
    this.$emit('changed', this.id)
  },
  watch: {
    bookID(next, prev) {
      const b = this.$store.state.books[this.id]
      if (b) {
        this.book = b
        this.id = b.id
      }
      else {
        this.book = null
        this.id = ''
      }
      this.$emit('changed', next)
    }
  }
}

</script>

<template>

<div class="field is-grouped">
  <div class="control">
    <input type="text" class="input" v-model="search">
  </div>
  <div class="control">
    <button v-if="!book" class="button is-static">
      Search book by title or isbn
    </button>
    <button v-if="book" class="button is-static">
      {{book.title}}
    </button>
  </div>
</div>

</template>
