<script>

import LeftBar from './components/LeftBar.vue'
import RightBar from './components/RightBar.vue'

export default ({
  name: 'App',
  components: {
    LeftBar, RightBar
  },
  watch: {
    '$store.state.user'(next, prev) {
      if (!prev && next && this.$store.state.noAccessPath.length) {
        const nap = this.$store.state.noAccessPath + ''
        this.$store.commit('setNAP', '')
        // eslint-disable-next-line  fp/no-mutating-methods
        this.$router.push(nap)
      }
    }
  },
  computed: {
    showHero() {
      return !!localStorage.getItem('1stVisit')
    }
  },
  async created() {
    localStorage.setItem('1stVist', new Date())
    await this.$store.dispatch('loadStage0')
  }
})
</script>

<template>
  <div>
    <section v-if="showHero" class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">A THOUSAND WORLDS</h1>
          <h2 class="subtitle">COLORFUL READS X COLORFUL PEOPLE<br/>Picture books curated by BIPOC leaders in the industry</h2>
        </div>
      </div>
    </section>
    <div class="columns" style="margin-top: 0;">
      <section class="leftbar column is-narrow is-hidden-mobile">
        <left-bar/>
      </section>
      <section class="main column">
        <router-view/>
      </section>
      <section class="rightbar column is-hidden-mobile">
        <right-bar/>
      </section>
    </div>
  </div>
</template>

<style lang="scss">

html {
  min-height: 100%;
}

body {
  min-height: 100%;
}

#app {
  font-family: DIN, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //color: #2c3e50;
  min-height: 100%;
}
</style>

<style lang="scss" scoped>
@import '@/assets/main.scss';

.leftbar {
  padding-top: 30px;
  padding-bottom: 30px;
  height: 100%;
  left: 0;
  width: $leftbar-width;
  //overflow-y: scroll;
  top: 0;
  z-index: 1;
}

.rightbar {
  background-color: white;
  border-left: solid 1px $atw-base;
  position: fixed;
  height: 100%;
  right: 0;
  top: 0;
  padding: 10px;
  padding-top: 30px;
  width: $rightbar-width;
  z-index: 1;
}

.main {
  padding-top: 30px;
  min-height: 100vh;
  border-left: solid 1px $atw-base;
  margin-right: calc(#{$rightbar-width} + 0.75rem); // column gap
  z-index: 1;
  @include until($tablet) {
    margin-left: 0px;
    margin-right: 0px;
  }
}

.hero {
  z-index: 10;
  background: $atw-base;
  position: relative;
  text-align: center;
  .title,.subtitle {
    color: #fff;
  }
}

</style>
