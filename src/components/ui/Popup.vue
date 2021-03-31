<script>

export default {
  props: ['popup'],
  methods: {
    close() {
      this.$store.dispatch('ui/close', this.popup.id)
    }
  },
}

</script>

<template>
  <div class="notification has-shadow m-10 py-10" :class="`is-${popup.type}`">
    <button v-if="popup.id" class="delete" @click.prevent="close" />
    <div class="message-body">
      {{ popup.text }}
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/elements/box.sass";
@import "bulma/sass/elements/notification.sass";
@import "bulma/sass/elements/other.sass"; // needed for notification delete button
@import '@/assets/style/vars.scss';
@import '@/assets/style/mixins.scss';

.notification {
  color: #fff;
  &:not(.is-danger) {
    @include primary('background-color');
  }
}

.has-shadow {
  box-shadow: $box-shadow;
}

</style>
