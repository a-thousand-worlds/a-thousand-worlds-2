<script>
export default {
  props: ['src'],
  created() {
    this.$store.dispatch('loadImage', this.src)
  },
  computed: {
    imageSrc() {
      return this.$store.state.images[this.src] || null
    }
  }
}
</script>

<template>
<img v-if="imageSrc" :src="imageSrc">
</template>
