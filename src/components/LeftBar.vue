<script>
import MainMenu from '@/components/MainMenu.vue'
import Logo from '../assets/logo.svg'

const menuOffset = -100
const menuRate = 1.2
const fadeStart = 60
const fadeEnd = 200

export default {
  components: {
    Logo,
    MainMenu,
  },
  props: {
    animateLogo: Boolean,
  },
  data() {
    return {
      menuOffset: this.animateLogo ? menuOffset * menuRate : 0,
      opacity: this.animateLogo ? 0 : 1,
    }
  },
  watch: {
    animateLogo(next) {
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
      if (this.animateLogo) {
        this.menuOffset = Math.min((window.scrollY + menuOffset) * menuRate, 0)
        this.opacity = Math.min(Math.max(0, window.scrollY - fadeStart), fadeEnd - fadeStart) / (fadeEnd - fadeStart)
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
      <router-link :to="{name: 'Home'}" :style="{ opacity: animateLogo ? opacity : null }">
        <Logo title="COLORFUL READS X COLORFUL PEOPLE: Picture books curated by leaders in the industry" style="max-width: 100px; max-height: 100px;" />
      </router-link>
    </div>

    <MainMenu :style="{ transform: `translateY(${menuOffset}px)` }" />

  </aside>
</template>
