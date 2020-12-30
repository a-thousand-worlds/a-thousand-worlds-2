<script>
import _ from 'lodash'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'
import { get } from '@/util/get-set'

export default {
  props: {
    name: String,
    placeholder: String,
    format: {
      type: String,
      validator: value => ['inline', 'oneline', 'multiline'].indexOf(value) !== -1,
      default: 'multiline'
    }
  },
  computed: {
    loaded() {
      return this.$store.state.content.loaded
    },
  },
  data() {
    const slotDefault = this.$slots.default?.()[0].children || ''
    return {
      editor: BalloonEditor,
      editorConfig: {
        placeholder: this.placeholder,
      },
      html: this.$store.getters['content/get'](this.name) ?? slotDefault,
    }
  },
  watch: {

    // only triggers when entire content property is changed, not single key
    // fires multiple times for some reason
    '$store.state.content.data'(next, prev) {
      const nextValue = get(next, this.name)
      if (nextValue) {
        this.html = nextValue
      }
    },

    html: _.debounce(function() {
      if (this.$can('editContent')) {
        this.$store.dispatch('content/save', { path: this.name, value: this.html })
      }
    }, 500)

  },
}

</script>

<template>
  <input v-if="format === 'oneline' || format === 'inline'" type="text" :class="format === 'oneline' ? 'input' : format" v-model="html" :disabled="!$can('editContent') || !loaded" />
  <ckeditor v-else :editor="editor" v-model="html" :config="editorConfig" :disabled="!$can('editContent') || !loaded" />
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

.inline {
  border: none;
  box-shadow: none;
  max-width: 100%;
  width: 100%;
}

</style>
