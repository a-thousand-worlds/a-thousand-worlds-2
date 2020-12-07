<script>
export default {
  props: ['src'],
  created() {
    this.$store.dispatch('loadImage', this.src)
  },
  watch: {
    src(next) {
      this.$store.dispatch('loadImage', this.src)
    }
  }
}
</script>

<template>
  <img v-if="$store.state.images[this.src]" :src="$store.state.images[this.src]">
</template>
