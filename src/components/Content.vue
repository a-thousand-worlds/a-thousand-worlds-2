<script>
import _ from 'lodash'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'
import { get } from '@/util/get-set'
import FirebaseUploadAdapter from '@/util/ckeditorFirebaseUploadAdapter'

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
  emits: ['data', 'change'],
  data() {
    return {
      editor: BalloonEditor,
      editorConfig: {
        placeholder: this.placeholder,
        extraPlugins: [FirebaseUploadAdapter]
      },
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

    save: _.debounce(function() {
      if (this.$can('editContent')) {
        this.$store.dispatch('content/save', { path: this.name, value: this.html })
      }
    }, 500)

  },
}

</script>

<template>
  <input v-if="format === 'oneline' || format === 'inline'" v-model="html" type="text" :class="format === 'oneline' ? 'input' : format" :disabled="!$can('editContent') || !loaded">
  <ckeditor v-else v-model="html" :editor="editor" :config="editorConfig" :disabled="!$can('editContent') || !loaded" />
</template>

<style scoped lang="scss">

.inline {
  border: none;
  box-shadow: none;
  max-width: 100%;
  width: 100%;
}

</style>
