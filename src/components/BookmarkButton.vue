<script>
export default {
  props: ['book'],
  methods: {
    bookmark() {
      if (!this.$iam('authorized')) {
        // eslint-disable-next-line fp/no-mutating-methods
        this.$router.push({ name: 'LogIn' })
      }
      console.log('bm me!', this.book)
    }
  },
  computed: {
    isMarked() {
      return false
    }
  }
}
</script>

<template>
<button @click.prevent="bookmark()">
  <i :class="{fas: isMarked, far: !isMarked}" class="fa-bookmark"></i>
</button>

</template>

<style lang="scss" scoped>
button {
  font-size: 200%;
  background: none;
  border: 0;
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 5px;
}
</style>
