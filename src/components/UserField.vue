<script>

export default {
  props: ['userID'],
  emits: ['changed'],
  data() {
    return {
      user: null,
      search: '',
      id: this.userID || ''
    }
  },
  created() {
    /*
    const b = this.$store.state.booksList[this.id]
    if (b) {
      this.book = b
      this.id = b.id
    }
    else {
      this.book = null
      this.id = ''
    }
    this.$emit('changed', this.id)
    */
  },
  watch: {
    /*
    bookID(next, prev) {
      const b = this.$store.state.booksList[this.id]
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
    */
  }
}

</script>

<template>

<div class="field is-grouped">
  <div class="control">
    <input type="text" class="input" v-model="search">
  </div>
  <div class="control">
    <button v-if="!user" class="button is-static">
      Search user by email or userID
    </button>
    <button v-if="user" class="button is-static">
      {{user.email}}
    </button>
  </div>
</div>

</template>
