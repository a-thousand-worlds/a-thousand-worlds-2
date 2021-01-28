<script>

export default {
  props: ['item'],
  computed: {
    url() {
      return this.item.cover?.url || this.item.cover || this.item.photo || this.item.thumbnail || ''
    },
  }
}
</script>

<template>
  <img :src="url" class="bg-secondary" style="max-width: 100%; min-width: 80px; min-height: 100px;">
</template>
