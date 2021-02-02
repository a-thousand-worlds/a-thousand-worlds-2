<script>
import * as slugify from '@sindresorhus/slugify'

export default {
  props: {
    editable: Boolean,
    nolink: Boolean,
    linkToManager: Boolean,
    tag: {
      required: true,
    },
    type: {
      type: String,
      validator: value => ['books', 'bundles', 'people'].indexOf(value) !== -1,
    }
  },
  emits: ['remove'],
  computed: {
    // map the prop type to the router type
    routerType() {
      return this.type === 'books' ? 'Home'
        : this.type === 'people' ? 'People'
        : this.type === 'bundles' ? 'Bundles'
        : null
    },
  },
  created() {
    if (!this.nolink && !this.type) {
      console.error('components/Tag: Type attribute is required unless nolink is specified.')
    }
  },
  methods: {
    goToFilter() {
      this.$store.commit(`${this.type}/setFilters`, [this.tag.id])
      this.$router.push({ name: this.routerType, query: { filters: slugify(this.tag.tag) } })
    },
    goToManager() {
      this.$router.push({ name: 'TagsManager', query: { active: this.type } })
    },
    removeTag() {
      this.$emit('remove', this.tag)
    },
  }
}

</script>

<template>
  <div v-if="tag" class="mr-1" style="display: inline-block;">
    <span v-if="nolink" class="button is-primary is-rounded is-mini" style="cursor: default;">
      <span>{{ tag.tag }}</span>
      <span v-if="editable" class="close" v-tippy="{ content: 'Remove tag from book' }" @click.prevent="removeTag">✕</span>
    </span>
    <a v-else-if="linkToManager" @click.prevent="goToManager" class="button is-primary is-rounded is-mini">{{ tag.tag }}</a>
    <button v-else class="button is-primary is-rounded is-mini mr-1 mb-1" style="display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis;">
        <span @click.prevent="goToFilter">{{ tag.tag }}</span>
        <span v-if="editable" class="close" v-tippy="{ content: 'Remove tag from book' }" @click.prevent="removeTag">✕</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/elements/table.sass";

.close {
  background-color: rgba(0, 0, 0, 0.25);
  border-radius: 999px;
  cursor: pointer;
  display: inline-block;
  font-size: 10px;
  height: 13px;
  line-height: 1.5;
  margin: 0 -4px 0 5px;
  vertical-align: middle;
  width: 13px;
}
</style>
