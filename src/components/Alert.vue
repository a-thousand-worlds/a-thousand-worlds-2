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
      this.$store.dispatch('alert', null)
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
      <button class="delete" @click.prevent="close" />
      <p>{{ text }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/mixins.sass";
@import "bulma/sass/utilities/controls.sass";
@import "bulma/sass/utilities/extends.sass";
@import "bulma/sass/elements/box.sass";
@import '@/assets/style/vars.scss';

.alert {
  position: fixed;
  z-index: $zAlert;
  top: 0;
  width: calc(100% - #{$leftbar-width} - #{$rightbar-width} + 0.75rem);
  font-size: 22px;

  @include until($tablet) {
    left: 0;
    width: 100%;
  }
}

.has-shadow {
  box-shadow: $box-shadow;
}

</style>
