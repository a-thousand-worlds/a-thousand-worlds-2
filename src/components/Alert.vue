<script>

export default {
  computed: {
    text() {
      return this.$store.state.alert?.text
    },
    type() {
      return this.$store.state.alert?.type
    }
  },
  methods: {
    close() {
      this.$store.commit('alert', null)
    }
  },
}

</script>

<template>
  <div v-if="text" class="alert is-flex is-justify-content-center">
    <div class="notification is-success m-10 py-10 has-shadow" :class="{
      'is-success': type === 'success',
      'is-error': type === 'error',
      'is-secondary': !type,
    }">
      <button class="delete" @click.prevent="close"></button>
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
