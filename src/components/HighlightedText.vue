<script>
import { remove as diacritics } from 'diacritics'

export default {
  props: {
    // if the search term contains a field that does not match, do not highlight
    // i.e. a different field was searched directly
    field: {
      type: String,
    },
    search: {
      required: true,
      type: String,
    },
  },
  computed: {
    searchMatchStart() {
      return this.search &&
        this.value &&
        (!this.searchField || this.searchField.trim().toLowerCase() === this.field)
        ? diacritics(this.value)
            .toLowerCase()
            .indexOf(diacritics(this.searchValue.trim()).toLowerCase())
        : -1
    },

    searchField() {
      const split = this.search.split(':')
      return split.length > 1 ? split[0] : null
    },

    searchValue() {
      const split = this.search.split(':')
      return split.length > 1 ? split[1] : split[0]
    },

    value() {
      return this.$slots.default()[0].children
    },
  },
}
</script>

<template>
  <span v-if="searchMatchStart >= 0">
    {{ value.slice(0, searchMatchStart)
    }}<span :class="{ 'bg-primary': searchMatchStart >= 0 }">{{
      value.slice(searchMatchStart, searchMatchStart + search.trim().length)
    }}</span
    >{{ value.slice(searchMatchStart + search.trim().length) }}
  </span>
  <span v-else>{{ value }}</span>
</template>
