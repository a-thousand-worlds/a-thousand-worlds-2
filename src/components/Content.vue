<script>
import _ from 'lodash'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'

export default {
  props: ['name', 'placeholder'],
  computed: {
    loaded() {
      return this.$store.state.stage0.loaded
    },
  },
  data() {
    return {
      editor: BalloonEditor,
      editorConfig: {
        placeholder: this.placeholder,
      },
      html: this.$store.getters.getContent(this.name) ?? '',
    }
  },
  watch: {

    // only triggers when entire content property is changed, not single key
    // fires multiple times for some reason
    '$store.state.content'(next, prev) {
      if (next[this.name]) {
        this.html = next[this.name]
      }
    },

    html: _.debounce(function() {
      this.$store.dispatch('saveContent', { key: this.name, value: this.html })
    }, 500)

  },
}

</script>

<template>
  <ckeditor :editor="editor" v-model="html" :config="editorConfig" :disabled="!loaded" />
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

</style>
