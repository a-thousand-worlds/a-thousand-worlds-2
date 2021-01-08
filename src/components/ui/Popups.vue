<script>

import Popup from '@/components/ui/Popup'

export default {
  components: {
    Popup,
  }
}

</script>

<template>
  <div class="popups-area">
    <div v-for="(pp, i) of $store.state.ui.popups" :key="i">
      <Popup class="mb-2" :popup="pp" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/vars.scss';

.popups-area {
  position: fixed;
  top: 30;
  left: 50%;
  width: 200px;
  margin-left: -100px;
  z-index: $zPopup;
}

</style>
