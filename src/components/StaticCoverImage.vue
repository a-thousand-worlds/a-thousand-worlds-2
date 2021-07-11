<script>
/** Renders a static cover image preserving its proportions. */
export default {
  props: ['item'],
  computed: {
    url() {
      const photoObject = this.item.cover || this.item.photo || this.item.thumbnail
      return photoObject?.url || photoObject || ''
    },
  },
}
</script>

<template>
  <img
    :src="url"
    class="bg-secondary"
    style="max-width: 100%; min-width: 80px; min-height: 100px"
  />
</template>
