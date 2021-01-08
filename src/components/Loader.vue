<template>
  <div class="loading-spinner" />
</template>

<style lang="scss" scoped>

.loading-spinner {
  width: 200px;
  height: 200px;
  background-size: cover;
  display: inline-block;
}
.theme1 .loading-spinner { background-image: url(~@/assets/icons/loading-red.gif) }
.theme2 .loading-spinner { background-image: url(~@/assets/icons/loading-gold.gif) }
.theme3 .loading-spinner { background-image: url(~@/assets/icons/loading-green.gif) }
.theme4 .loading-spinner { background-image: url(~@/assets/icons/loading-blue.gif) }

</style>
