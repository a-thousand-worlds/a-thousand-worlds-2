<script>

import LeftBar from './components/LeftBar.vue'
import RightBar from './components/RightBar.vue'

export default {
  name: 'App',
  components: {
    LeftBar, RightBar
  },
  async created() {
    await this.$store.dispatch('loadStage0')
  }
}
</script>

<template>
  <section class="hero has-centredtext">
    <div class="block mt-5 mb-3">
      <h1 class="title is-1">A&nbsp;Thousand Worlds</h1>
      <h2 class="subtitle is-5 is-hidden-touch">COLORFUL READS X COLORFUL PEOPLE: Picture books curated by leaders in the industry</h2>
    </div>
  </section>
  <div class="level is-align-items-flex-start py-5">
    <section class="leftbar is-align-self-stretch level-left is-hidden-touch">
      <left-bar/>
    </section>
    <section class="main level-item">
      <router-view/>
    </section>
    <section class="rightbar level-right is-hidden-touch">
      <right-bar/>
    </section>
  </div>
  <footer class="footer">
    footer
  </footer>
</template>


<style lang="scss">
@import '@/assets/vars.scss';

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

.hero {
  background: $atw-base;
  text-align: center;

  .title {
    font-size: 200%;
    text-transform: uppercase;
    color: #fff;
  }
  .subtitle {
    color: #fff;
  }
}

</style>
