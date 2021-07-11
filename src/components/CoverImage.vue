<script>
/** Renders a square cover image from a book or person. */
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
  <span
    class="bg-secondary"
    :style="{
      backgroundImage: `url(${url})`,
      backgroundSize: 'cover',
      backgroundPosition: '50% 10%',
      display: 'inline-block',
      paddingTop: '100%',
      width: '100%',
      minWidth: '50px',
      minHeight: '50px',
    }"
  />
</template>
