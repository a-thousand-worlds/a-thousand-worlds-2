<script>
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'
import FirebaseUploadAdapter from '@/util/ckeditorFirebaseUploadAdapter'

export default {
  props: ['modelValue', 'config', 'disabled', 'placeholder', 'format'],
  emits: ['update:modelValue'],
  data() {
    console.log('cfg', this.config)
    return {
      html: this.modelValue || '',
      editor: BalloonEditor,
      editorConfig: {
        placeholder: this.placeholder,
        extraPlugins: [FirebaseUploadAdapter]
      }
    }
  },
  watch: {
    html() {
      this.$emit('update:modelValue', this.html)
    }
  }
}

</script>

<template>
  <input v-if="format === 'oneline' || format === 'inline'" v-model="html" type="text" :class="format === 'oneline' ? 'input' : format" :disabled="disabled">
  <ckeditor v-else v-model="html" :editor="editor" :config="editorConfig" :disabled="disabled" />
</template>

<style scoped lang="scss">

.inline {
  border: none;
  box-shadow: none;
  max-width: 100%;
  width: 100%;
}

</style>
