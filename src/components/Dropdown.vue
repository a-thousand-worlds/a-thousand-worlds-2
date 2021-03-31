<script>
export default {
  props: {
    modelValue: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true,
      validator: arr => arr && arr.every(option => option.id != null && option.text != null),
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      active: false,
    }
  },
  methods: {
    close() {
      this.active = false
    },
    getLabel(id) {
      return this.options.find(option => option.id === id)?.text
    },
  }
}
</script>

<template>

  <div>
    <div class="dropdown mt-4 no-user-select" :class="{ 'is-active': active }">
      <div id="dropdown-menu" class="dropdown-menu" role="menu">
        <div class="dropdown-content" style="max-height: 19.5em; overflow: scroll;">
          <a v-for="option in options" :key="option.id" class="dropdown-item is-capitalized" @click.prevent="$emit('update:modelValue', option.id)">
            {{ option.text }}
          </a>
        </div>
      </div>
    </div>

    <!-- title -->
    <a @click.prevent.stop="active = !active" v-click-outside="close" class="primary-hover no-user-select" :class="{ 'is-primary': active }">{{ getLabel(modelValue) }}</a>
  </div>

</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/components/dropdown.sass";
</style>
