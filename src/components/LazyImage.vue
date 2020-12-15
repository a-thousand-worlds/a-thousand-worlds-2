<script>
export default {
  props: ['src'],
  created() {
    // this.$store.dispatch('loadImage', this.src)
  },
  watch: {
    // src(next) {
    // this.$store.dispatch('loadImage', this.src)
    // }
  }
}
</script>

<template>
  <img :src="src">
</template>
