<script>
import debounce from 'lodash/debounce'
import { get } from '@/util/get-set'
import { defineAsyncComponent } from 'vue'

export default {
  components: {
    CEditor: defineAsyncComponent(() =>
      import(/* webpackChunkName: "ckeditor" */ '@/components/CEditor'),
    ),
  },
  props: {
    name: String,
    placeholder: String,
    format: {
      type: String,
      validator: value => ['inline', 'oneline', 'multiline'].indexOf(value) !== -1,
      default: 'multiline',
    },
  },
  emits: ['data', 'change'],
  data() {
    return {
      html: this.getContent(),
    }
  },
  computed: {
    loaded() {
      return this.$store.state.content.loaded
    },
  },
  watch: {
    html() {
      this.save()
      this.$emit('change', {
        html: this.html,
        name: this.name,
      })
    },

    // manual watch name prop to update html since getter cannot be watched
    name() {
      this.html = this.getContent()
    },

    // only triggers when entire content property is changed, not single key
    // fires multiple times for some reason
    '$store.state.content.data'(next, prev) {
      const nextValue = get(next, this.name)
      if (nextValue) {
        this.html = nextValue
        this.$emit('data', {
          data: nextValue,
          name: this.name,
        })
      }
    },
  },
  methods: {
    getContent() {
      const slotDefault = this.$slots.default?.()[0].children || ''
      return this.$store.getters['content/get'](this.name) ?? slotDefault
    },

    save: debounce(function () {
      if (this.$can('editContent')) {
        this.$store.dispatch('content/save', { path: this.name, value: this.html })
      }
    }, 500),
  },
}
</script>

<template>
  <CEditor v-if="$can('editContent')" v-model="html" :format="format" :placeholder="placeholder" />
  <div v-else :innerHTML="html" />
</template>
