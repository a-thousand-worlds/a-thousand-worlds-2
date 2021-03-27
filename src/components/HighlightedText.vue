<script>
import { remove as diacritics } from 'diacritics'

export default {
  props: {
    search: {
      required: true,
      type: String,
    },
  },
  computed: {

    searchMatchStart() {
      return this.search
        && this.value
        && diacritics(this.value).toLowerCase().indexOf(diacritics(this.search.trim()).toLowerCase())
    },

    value() {
      return this.$slots.default()[0].children
    },

  }
}
</script>

<template>
  <span v-if="searchMatchStart >= 0">
    {{ value.slice(0, searchMatchStart) }}<span :class="{ 'bg-primary': searchMatchStart >= 0 }">{{ value.slice(searchMatchStart, searchMatchStart + search.trim().length) }}</span>{{ value.slice(searchMatchStart + search.trim().length) }}
  </span>
  <span v-else>{{ value }}</span>
</template>
