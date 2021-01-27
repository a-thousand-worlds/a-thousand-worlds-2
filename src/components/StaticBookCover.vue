<script>

export default {
  props: ['book'],
  computed: {
    url() {
      return (this.book.cover?.url?.startsWith('http')
        ? this.book.cover?.url
        : this.book.cover) || this.book.thumbnail || ''
    },
  }
}
</script>

<template>
  <img :src="url" class="bg-secondary" style="max-width: 100%; min-width: 80px; min-height: 100px;">
</template>
