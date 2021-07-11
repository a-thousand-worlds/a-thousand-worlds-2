<script>
/* A welcome banner that disappears after being scrolled past. */

import Welcome from '@/components/Welcome'

export default {
  components: {
    Welcome,
  },
  data() {
    return {
      height: 0,
      show: true,
    }
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll)
  },
  unmounted() {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    // once the banner is scrolled completely out of view, hide the welcome banner
    onScroll() {
      // wait till initial scroll to set height
      // logo is not loaded in mounted so height is incorrect then
      if (!this.height) {
        this.height = this.$refs.welcomeFixed?.$refs.welcome?.clientHeight || 250
      }

      if (this.show && window.scrollY > this.height) {
        this.show = false
        this.$store.commit('ui/setLastVisited', new Date())
        window.removeEventListener('scroll', this.onScroll)
      }
    },
  },
}
</script>

<template>
  <div v-if="show">
    <Welcome :style="{ position: 'fixed' }" ref="welcomeFixed" />
    <!--

      Statically position duplicate in order to force page content down by dynamic height of welcome message.

      If we only use a single static component, then the bookmark icon in the right sidebar overlaps the banner. It can't be solved with z-indexes due to circularity: rightbar > main > welcome > rightbar.

    -->
    <Welcome :style="{ position: 'static', visibility: 'hidden' }" />
  </div>
</template>
