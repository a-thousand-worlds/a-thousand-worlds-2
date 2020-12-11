<script>
import _ from 'lodash'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'

export default {
  props: ['name', 'placeholder'],
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
    // update store (debounced)
    html: _.debounce(function() {
      this.$store.dispatch('saveContent', { key: this.name, value: this.html })
    }, 500)
  },
}

</script>

<template>
  <ckeditor :editor="editor" v-model="html" :config="editorConfig" />
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

</style>
