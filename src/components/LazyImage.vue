<script>
export default {
  props: ['src'],
  data: () => ({ fallback: false }),
  computed: {
    url() {
      let ret = this.src?.url || this.src || ''
      if (!this.fallback) ret = this.src?.cache || ret
      return ret
    },
  },
}
</script>

<template>
  <img v-if="url.length" :src="url" @error="fallback = true" />
</template>
