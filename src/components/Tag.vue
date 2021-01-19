<script>

export default {
  props: {
    nolink: Boolean,
    tag: {
      required: true,
    }
  },
  methods: {
    goToFilter() {
      this.$store.commit('books/setFilters', [this.tag.id])
      this.$router.push({ name: 'Home' })
    },
  }
}

</script>

<template>
  <span v-if="tag">
    <span v-if="nolink" style="cursor: default;">{{ tag.tag }}</span>
    <a v-else @click.prevent="goToFilter" class="button is-primary is-rounded is-mini mr-1 mb-1" style="display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis;">{{ tag.tag }}</a>
  </span>
</template>
