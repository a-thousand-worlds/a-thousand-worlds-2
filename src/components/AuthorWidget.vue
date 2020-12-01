<script>
export default {
  props: ['name'],
  data() {
    return {
      person: null
    }
  },
  created() {
    this.person = this.$store.state.people.reduce((acc, x) => x.name === this.name ? x : acc, null)
  },
  computed: {
    isAuthor() {
      if (!this.person) {
        return true
      }
      return this.person.role === 'author'
    }
  }
}
</script>

<template>
  <i v-if="isAuthor" class="fas fa-pencil-alt"></i>
  <i v-if="!isAuthor" class="fas fa-palette"></i>
  <span class="name ml-2">{{name}}</span>
</template>
