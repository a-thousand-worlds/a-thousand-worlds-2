<script>
export default {
  props: {},
  data() {
    return {
      percent: 0,
      increment: 0.3,
    }
  },
  computed: {
    width() {
      return this.percent * 100 + '%'
    },
  },
  created() {
    setInterval(() => {
      this.percent += this.increment
      if (this.increment > 0.0003) {
        this.increment *= 2 / 3
      }
    }, 100)
  },
}
</script>

<template>
  <div style="height: 20px; border-radius: 3px; overflow: hidden">
    <div
      class="bg-primary"
      :style="`width: ${width};`"
      style="height: 100%; transition: width 0.5s ease-in-out"
    />
  </div>
</template>

<style lang="scss" scoped>
.loading-spinner {
  width: 200px;
  height: 200px;
  background-size: cover;
  display: inline-block;
}
.theme1 .loading-spinner {
  background-image: url(~@/assets/icons/loading-red.gif);
}
.theme2 .loading-spinner {
  background-image: url(~@/assets/icons/loading-gold.gif);
}
.theme3 .loading-spinner {
  background-image: url(~@/assets/icons/loading-green.gif);
}
.theme4 .loading-spinner {
  background-image: url(~@/assets/icons/loading-blue.gif);
}
</style>
