<script>
import _ from 'lodash'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'
import get from '@/util/get'

export default {
  props: ['name', 'placeholder', 'format'],
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
      const nextValue = get(next, this.name)
      if (nextValue) {
        this.html = nextValue
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
  <input v-if="format === 'one-line'" type="text" class="input" :class="className" v-model="html" :disabled="!canEdit || !loaded" />
  <ckeditor v-else :editor="editor" v-model="html" :config="editorConfig" :disabled="!canEdit || !loaded" :class="className" />
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

</style>
