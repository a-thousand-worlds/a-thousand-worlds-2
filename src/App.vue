<script>

import BookmarkIcon from './assets/icons/bookmark.svg'
import BooksIcon from './assets/icons/books.svg'
import BundlesIcon from './assets/icons/bundles.svg'
import FilterIcon from './assets/icons/filter.svg'
import HamburgerIcon from './assets/icons/hamburger.svg'
import LeftBar from './components/LeftBar.vue'
import RightBar from './components/RightBar.vue'

export default ({
  name: 'App',
  components: {
    BookmarkIcon,
    BundlesIcon,
    BooksIcon,
    FilterIcon,
    HamburgerIcon,
    LeftBar,
    RightBar,
  },
  data() {
    return {
      showMobileFilter: true
    }
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
          <h1 class="title is-uppercase">A Thousand Worlds</h1>
          <h2 class="subtitle"><span class="is-uppercase">Colorful Reads X Colorful People</span><br/>
          Picture books curated by BIPOC leaders in the industry</h2>
        </div>
      </div>
    </section>

    <section class="mobile-top-nav is-hidden-tablet is-flex is-justify-content-space-between">
      <h1 class="title is-uppercase">A Thousand Worlds</h1>
      <HamburgerIcon class="mt-1" />
    </section>

    <section class="mobile-bottom-nav is-hidden-tablet is-flex is-justify-content-center has-text-centered is-uppercase">
      <ul class="menu-list">

        <li v-if="showMobileFilter" >
          <a :class="null" @click.prevent="null" href="#">
            <FilterIcon/>
            <div class="icon-label mt-2">Filter</div>
          </a>
        </li>

        <li>
          <router-link :to="{ name: 'Home' }">
            <BooksIcon/>
            <div class="icon-label mt-2">Books</div>
          </router-link>
        </li>

        <li>
          <router-link :to="{ name: 'Bundles' }">
            <BundlesIcon/>
            <div class="icon-label mt-2">Bundles</div>
          </router-link>
        </li>

        <li>
          <a :class="null" @click.prevent="null" href="#">
            <BookmarkIcon/>
            <div class="icon-label mt-2">Saved Items</div>
          </a>
        </li>

      </ul>

    </section>

    <div class="columns" style="margin-top: 0;">
      <section class="leftbar column is-narrow is-hidden-mobile">
        <left-bar/>
      </section>
      <section class="main column px-0 pb-50">
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

.mobile-top-nav {
  padding: 10px 20px;
  position: sticky;
  top: 0;
  border-bottom: solid 1px $atw-base;
  background-color: white;
  z-index: 1;

  .title {
    font-size: 20px;
    margin: 0;
  }
}

.mobile-bottom-nav {
  width: 100%;
  padding: 10px 20px;
  position: fixed;
  bottom: 0;
  border-top: solid 1px $atw-base;
  background-color: white;
  z-index: 1;
  font-size: 10px;
  font-weight: bold;

  .title {
    font-size: 20px;
    margin: 0;
  }

  .menu-list {
    li {
      display: inline-block;
      min-width: 100px;
    }
  }
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
