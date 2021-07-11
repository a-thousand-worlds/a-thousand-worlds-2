<script>
import Multiselect from '@/components/Multiselect'

/** A multiselect dropdown menu for adding tags to books. */
export default {
  components: {
    Multiselect,
  },
  props: {
    item: {
      required: true,
    },
    // type of tags: books, bundles, or people
    type: {
      type: String,
      required: true,
      validator: value => ['books', 'bundles', 'people'].includes(value),
    },
  },
  computed: {
    selected() {
      const itemTags = this.$store.state.tags[this.type].data || {}
      return Object.keys(this.item?.[this.type === 'people' ? 'identities' : 'tags'] || [])
        .map(id => itemTags[id])
        .filter(x => x)
    },

    options() {
      return this.$store.getters[`tags/${this.type}/listSorted`]()
    },
  },
  methods: {
    toggle({ option, value }) {
      this.$store.dispatch(`${this.type}/update`, {
        path: `${this.item.id}/${this.type === 'people' ? 'identities' : 'tags'}`,
        value: {
          [option.id]: value || null,
        },
      })
    },
  },
}
</script>

<template>
  <Multiselect label="ADD TAG" :selected="selected" :options="options" @select="toggle" />
</template>
