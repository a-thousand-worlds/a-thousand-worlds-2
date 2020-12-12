<script>

export default {
  props: ['open'],
  emits: ['toggle'],
  data() {
    return {
      isOpen: this.open ?? false,
    }
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen
      this.$emit('toggle', this.isOpen)
    }
  }
}

</script>

<template>
  <a @click.prevent="toggle" style="user-select: none;">
    <span class="icon is-small mb-10" style="position: relative; top: 1px;">
      <i class="fas mr-1" :class="'fa-angle-' + (isOpen ? 'down' : 'right')" aria-hidden="true" style="color: black;"></i>
    </span>
    <slot name="label">label</slot>
  </a>
  <slot name="content" v-if="isOpen">content</slot>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

</style>
