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
  <a style="user-select: none;" @click.prevent="toggle">
    <span class="icon is-small mb-10" style="position: relative; top: 1px;">
      <i class="fas mr-1" :class="'fa-angle-' + (isOpen ? 'down' : 'right')" aria-hidden="true" style="color: black;" />
    </span>
    <slot name="label">label</slot>
  </a>
  <slot v-if="isOpen" name="content">content</slot>
</template>

<style scoped lang="scss">
@import '@/assets/vars.scss';

</style>
