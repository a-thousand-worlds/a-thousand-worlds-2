<script>

export default {
  props: ['type'],
  computed: {
    text() {
      return this.$store.alert
    },
  },
}

</script>

<template>
  <div v-if="text" class="alert is-flex is-justify-content-center">
    <div class="notification is-success m-10 py-10 has-shadow" :class="{
      'is-success': type === 'success',
      'is-error': type === 'error',
      'is-primary': !type,
    }">
      <button class="delete"></button>
      <p>{{ text }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

.alert {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  font-size: 22px;
}

.has-shadow {
  box-shadow: $box-shadow;
}

</style>
