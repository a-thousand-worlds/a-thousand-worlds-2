<script>
import * as slugify from '@sindresorhus/slugify'

export default {
  props: {
    nolink: Boolean,
    tag: {
      required: true,
    },
    type: {
      type: String,
      required: true,
      validator: value => ['books', 'bundles', 'people'].indexOf(value) !== -1,
    }
  },
  computed: {
    // map the prop type to the router type
    routerType() {
      return this.type === 'books' ? 'Home'
        : this.type === 'people' ? 'People'
        : this.type === 'bundles' ? 'Bundles'
        : null
    },
  },
  methods: {
    goToFilter() {
      this.$store.commit(`${this.type}/setFilters`, [this.tag.id])
      this.$router.push({ name: this.routerType, query: { filters: slugify(this.tag.tag) } })
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
