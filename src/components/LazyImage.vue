<script>
export default {
  props: ['src'],
  computed: {
    url() {
      return this.src?.cache || this.src?.url || this.src || ''
    },
  },
}
</script>

<template>
  <img v-if="url.length" :src="url" />
</template>
