<script>
import debounce from 'lodash/debounce'
import { get } from '@/util/get-set'
import { defineAsyncComponent } from 'vue'

const CEditor = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "ckeditor" */ '@/components/CEditor'),
  // loadingComponent option is not working for some reason
  // loadingComponent: () => 'Loading...',
})

/** Returns a promise that resolves when the async component is loaded. */
const componentLoaded = (asyncComponent, pollFrequency = 100) =>
  new Promise(resolve => {
    const timerRef = {}
    timerRef.current = setInterval(() => {
      if (asyncComponent.__asyncResolved) {
        clearInterval(timerRef.current)
        resolve(asyncComponent.__asyncResolved)
      }
    }, pollFrequency)
  })

export default {
  components: {
    CEditor,
  },
  props: {
    class: String,
    name: String,
    placeholder: String,
    format: {
      type: String,
      // format is passed directly to CEditor
      //   inline               Causes CKEditor to render as a simple input element.
      //   oneline              A full-width inline element.
      //   multiline            Default.
      //   label                Uses a multiline CKEditor, but overrides styles to make inline.
      validator: value => ['inline', 'oneline', 'multiline', 'label'].indexOf(value) !== -1,
      default: 'multiline',
    },
  },
  emits: ['data', 'change'],
  data() {
    return {
      // set to true once CEditor is asynchronously loaded
      editorLoaded: false,
      html: this.getContent(),
    }
  },
  computed: {
    // map class prop to className to avoid syntax errors in template
    className() {
      return this.class
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
  created() {
    componentLoaded(CEditor).then(() => {
      this.editorLoaded = true
    })
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
  <span
    :class="{
      'content-component': true,
      [`format-${format}`]: true,
      'can-edit': $can('editContent'),
    }"
  >
    <!-- render a hidden dummy CEditor in order to trigger async component loading, otherwise there is a flash. -->
    <CEditor v-if="!editorLoaded && $can('editContent')" v-show="false" />
    <!-- apply className directly to CEditor since if it is rendered as an inline input, styles like font size won't cascade from the parent -->
    <CEditor
      v-if="editorLoaded && $can('editContent')"
      v-model="html"
      :format="format"
      :placeholder="placeholder"
      :class="className"
    />
    <!-- apply className directly to div -->
    <div v-else :innerHTML="html" :class="className" />
  </span>
</template>

<!-- unscoped to apply to innerHTML and CKEditor -->
<style lang="scss">
.content-component {
  &.can-edit {
    cursor: context-menu;
    input:not(:focus) {
      cursor: context-menu;
    }
  }

  .ck-focused {
    cursor: text;
  }

  // remove margin from first and last paragraphs
  .ck.ck-editor__editable_inline {
    border: 0;
    padding: 8px;
    margin-left: -8px;
    margin-right: -8px;
    margin-top: -8px;

    & > :first-child,
    & > :last-child {
      margin-top: 0;
      margin-bottom: 0;
    }

    // use outline instead of border to avoid affecting the layout
    &.ck-editor__editable:not(.ck-editor__nested-editable).ck-focused {
      border: 0;
      outline: var(--ck-focus-ring);
    }
  }

  &.format-label > div,
  &.format-label .ck.ck-editor__editable_inline {
    display: inline;
    padding: 0;
    margin: 0;
    p {
      display: inline;
      line-height: 1.5;
    }
  }
}
</style>
