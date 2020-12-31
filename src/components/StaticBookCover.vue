<script>

export default {
  props: ['book'],
}
</script>

<template>
  <img :src="book.thumbnail || book.cover" style="max-width: 100%; min-width: 60px; min-height: 100px;">
</template>
