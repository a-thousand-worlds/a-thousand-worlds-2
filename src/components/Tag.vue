<script>

export default {
  // TODO: Pass tag id as prop not tag name
  props: ['nolink', 'tag'],
  computed: {
    tagObject() {
      const tagObject = this.$store.getters['tags/books/findBy']('tag', this.tag)
      return tagObject
    },
  },
  methods: {
    toFilter() {
      this.$store.commit('books/setFilters', [this.tagObject.tag])
      this.$router.push({ name: 'Home' })
    },
  }
}

</script>

<template>
  <span v-if="tagObject">
    <span v-if="nolink" style="cursor: default;">{{ tagObject.tag }}</span>
    <a v-else @click.prevent="toFilter" class="button is-primary is-rounded is-mini mr-1 mb-1" style="display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis;">{{ tagObject.tag }}</a>
  </span>
</template>
