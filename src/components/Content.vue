<script>
import _ from 'lodash'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'

export default {
  props: ['name', 'placeholder'],
  computed: {
    canEdit() {
      return this.$iam('admin') || this.$iam('superadmin')
    },
    loaded() {
      return this.$store.state.content.loaded
    },
  },
  data() {
    return {
      editor: BalloonEditor,
      editorConfig: {
        placeholder: this.placeholder,
      },
      html: this.$store.getters['content/get'](this.name) ?? '',
    }
  },
  watch: {

    // only triggers when entire content property is changed, not single key
    // fires multiple times for some reason
    '$store.state.content.data'(next, prev) {
      if (next[this.name]) {
        this.html = next[this.name]
      }
    },

    html: _.debounce(function() {
      if (this.canEdit) {
        this.$store.dispatch('content/save', { key: this.name, value: this.html })
      }
    }, 500)

  },
}

</script>

<template>
  <ckeditor :editor="editor" v-model="html" :config="editorConfig" :disabled="!canEdit || !loaded" />
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

</style>
