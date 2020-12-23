<script>

export default {
  props: ['popup']
}

</script>

<template>
  <div class="popup message" :class="'is-'+popup.type">
    <div class="message-body">
      {{popup.text}}
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

</style>
