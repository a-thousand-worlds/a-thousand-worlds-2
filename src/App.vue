<script>

import MobileHeader from '@/components/MobileHeader'
import MobileFooter from '@/components/MobileFooter'
import LeftBar from '@/components/LeftBar.vue'
import RightBar from '@/components/RightBar.vue'
import BookmarksView from '@/components/BookmarksView'

export default ({
  name: 'App',
  components: {
    LeftBar,
    RightBar,
    MobileHeader,
    MobileFooter,
    BookmarksView
  },
  watch: {
    '$route'(next) {
      this.showMobileFilter = next.name === 'Home' || next.name === 'Bundles'
    },
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
    await this.$store.dispatch('loadStage0')
  },
  beforeRouteLeave(from, to) {
    localStorage.setItem('1stVist', new Date())
  }
})
</script>

<template>
  <div>
    <mobile-header class="is-hidden-tablet"/>
    <section v-if="showHero" class="hero">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-uppercase">A Thousand Worlds</h1>
          <h2 class="subtitle"><span class="is-uppercase">Colorful Reads X Colorful People</span><br/>
          Picture books curated by BIPOC leaders in the industry</h2>
        </div>
      </div>
    </section>

    <div class="columns my-0">
      <section class="leftbar column is-narrow is-hidden-mobile">
        <left-bar/>
      </section>
      <section class="main column px-0 pb-50" :class="{'with-bookmarks': $store.state.bookmarksOpen}">
        <router-view/>
      </section>
      <section v-if="$store.state.bookmarksOpen" class="bookmarks column px-0 pb-50">
        <bookmarks-view/>
      </section>
      <section class="rightbar column is-hidden-mobile">
        <right-bar/>
      </section>
    </div>
    <mobile-footer class="is-hidden-tablet"/>
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

.bookmarks {
  margin-right: calc(#{$rightbar-width} + 0.75rem); // column gap
  height: 100%;

  @include until($tablet) {
    margin-left: 0px;
    margin-right: 0px;
    margin-top: 40px;
    margin-bottom: 80px;
  }
}

.main {
  padding-top: 30px;
  min-height: 100vh;
  border-left: solid 1px $atw-base;
  margin-right: calc(#{$rightbar-width} + 0.75rem); // column gap
  z-index: 1;

  &.with-bookmarks {
    border-right: solid 1px $atw-base;
    margin-right: 0.75rem;
  }

  @include until($tablet) {
    margin-left: 0px;
    margin-right: 0px;
    margin-top: 20px;
    margin-bottom: 80px;

    &.with-bookmarks {
      display: none;
    }
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
