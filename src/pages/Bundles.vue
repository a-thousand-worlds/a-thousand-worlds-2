<script>
import Filter from '../components/Filter.vue'

export default {
  name: 'BundlesPage',
  components: {
    Filter,
  },
  computed: {
    bundles() {
      return this.$store.state.bundles.data
    },
    bundleTags() {
      return this.$store.state.tags.bundles.data
    },
  },
  watch: {
    bundleTags(next, prev) {
      // load filters from url when tags/bundles are first loaded
      if (Object.keys(prev).length === 0 && Object.keys(next).length > 0) {
        this.$store.dispatch('bundles/setFiltersFromUrl', 'bundles')
      }
    }
  },
}

</script>

<template>

  <teleport to="#bundles-filter-menu">
    <Filter type="bundles" />
  </teleport>

  <div class="container is-flex is-flex-direction-row is-flex-wrap-wrap p-3">
    <div v-for="bundle of bundles" :key="bundle.id" :class="{'with-bookmarks': $store.state.ui.bookmarksOpen}" class="has-text-centered bundle-block p-3">
      {{ bundle }}
    </div>
  </div>

</template>

<style>

</style>
