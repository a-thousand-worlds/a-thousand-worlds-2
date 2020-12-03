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
    <div class="columns">
      <section class="leftbar is-hidden-touch">
        <left-bar/>
      </section>
      <section class="main column">
        <router-view/>
        <!-- <footer class="footer">
          footer
        </footer> -->
      </section>
      <section class="rightbar is-hidden-touch">
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

$leftbar-width: 340px;
$rightbar-width: 70px;

.rightbar {
position: fixed;
height: 100%;
border-left: 1px solid $atw-base;
right: 0;
top: 0;
padding: 10px;
padding-top: 30px;
width: $rightbar-width;
z-index: 1;
}

.leftbar {
padding: 20px;
padding-top: 30px;
position: fixed;
height: 100%;
border-right: 1px solid $atw-base;
left: 0;
width: $leftbar-width;
//overflow-y: scroll;
top: 0;
z-index: 1;
}

.main {
margin-left: $leftbar-width;
margin-right: $rightbar-width;
padding: 30px;
z-index: 1;
@include until($desktop) {
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
