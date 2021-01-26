<script>
import MainMenu from '@/components/MainMenu.vue'
import Logo from '../assets/logo.svg'

export default {
  components: {
    Logo,
    MainMenu,
  },
  data() {
    return {
      menuOffset: -50,
      opacity: 0,
    }
  },
  computed: {
    showWelcome() {
      return !this.$store.state.ui.lastVisited && !this.$route.meta?.access
    },
  },
  watch: {
    showWelcome(next) {
      this.onScroll()
    },
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
      if (this.showWelcome) {
        this.menuOffset = Math.min(window.scrollY - 100, 0) / 2
        this.opacity = Math.min(Math.max(0, window.scrollY - 80), 90) / 90
      }
      else {
        this.menuOffset = 0
        this.opacity = 1
        window.removeEventListener('scroll', this.onScroll)
      }
    }
  }
}
</script>

<template>
  <aside class="is-align-self-stretch menu is-flex-direction-column is-justify-content-space-between">

    <div class="mb-10">
      <router-link :to="{name: 'Home'}" :style="{ opacity: showWelcome ? opacity : null }">
        <Logo title="COLORFUL READS X COLORFUL PEOPLE: Picture books curated by leaders in the industry" style="max-width: 100px; max-height: 100px;" />
      </router-link>
    </div>

    <MainMenu :style="{ transform: `translateY(${menuOffset}px)` }" />

  </aside>
</template>
