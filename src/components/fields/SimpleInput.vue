<script>

export default {
  props: ['modelValue', 'disabled'],
  emits: ['update:modelValue'],
  data() {
    return {
      title: this.modelValue || '',
      mode: 'view'
    }
  },
  methods: {
    updateValue(e) {
      this.$emit('update:modelValue', this.title)
    },
    onDivClick() {
      if (this.disabled) {
        return
      }
      this.mode = 'edit'
      // on the moment of function execution $refs.input
      // is still not exists beacuse of v-if
      // so timeout 0 used to wait it to be created
      setTimeout(() => {
        this.$refs.input.focus()
      }, 0)
    },
    onEnter() {
      this.mode = 'view'
    },
    onInputBlur() {
      this.$emit('update:modelValue', this.title)
      this.mode = 'view'
    },
    onEsc() {
      this.mode = 'view'
    }
  },
  watch: {
    modelValue(next, prev) {
      this.title = next
    }
  }
}
</script>

<template>

<div class="control">
  <div class="field is-grouped">
    <div class="control w-50">
      <div :class="{disabled:disabled}" class="w-50 pointer" v-if="mode === 'view'" @click="onDivClick()">{{title}}</div>
      <input
        v-if="mode === 'edit'"
        @blur="onInputBlur"
        @keyup.enter="onEnter"
        @keyup.escape="onEsc"
        @input="updateVal"
        ref="input"
        type="text"
        class="input"
        v-model="title">
    </div>
  </div>
</div>

</template>

<style lang="scss" scoped>

.input {
  margin-top: -0.25rem;
  margin-left: -0.25rem;
  padding: 0.2rem;
  height: 2rem;
}

.w-50 {
  min-width: 50%;
  min-height: 24px;
}

.pointer {
  cursor: text;
}

.disabled {
  color: #ddd;
}

</style>
