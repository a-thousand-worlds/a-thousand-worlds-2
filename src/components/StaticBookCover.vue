<script>

export default {
  props: ['book'],
}
</script>

<template>
  <img :src="book.thumbnail || book.cover" class="bg-secondary" style="max-width: 100%; min-width: 80px; min-height: 100px;">
</template>
