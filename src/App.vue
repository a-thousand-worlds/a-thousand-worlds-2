<script>

import Alert from '@/components/Alert'
import BookmarksView from '@/components/BookmarksView'
import Confirm from '@/components/ui/Confirm'
import LeftBar from '@/components/LeftBar.vue'
import MobileFooter from '@/components/MobileFooter'
import MobileHeader from '@/components/MobileHeader'
import Popups from '@/components/ui/Popups'
import Prompt from '@/components/ui/Prompt'
import RightBar from '@/components/RightBar.vue'
import Welcome from '@/components/Welcome'

export default ({
  name: 'App',
  components: {
    Alert,
    BookmarksView,
    Confirm,
    LeftBar,
    MobileFooter,
    MobileHeader,
    Popups,
    Prompt,
    RightBar,
    Welcome,
  },
  watch: {
    '$route'(next) {
      this.showMobileFilter = next.name === 'Home' || next.name === 'Bundles'
    },
    '$store.state.user.user'(next, prev) {
      if (!prev && next && this.$store.state.noAccessPath.length) {
        const nap = this.$store.state.noAccessPath + ''
        this.$store.commit('setNAP', '')
        // eslint-disable-next-line  fp/no-mutating-methods
        this.$router.push(nap)
      }
    }
  },
  data() {
    return {
      showWelcome: !localStorage.getItem('lastVisited')
    }
  },
  async created() {
    await this.$store.dispatch('load')
  },
})
</script>

<template>
  <div>

    <mobile-header class="is-hidden-tablet"/>

    <div v-if="showWelcome">
      <Welcome :style="{ position: 'fixed' }" />
      <!-- statically positioned duplicatte in order to force page content down by dynamic height of welcome message -->
      <Welcome :style="{ position: 'static', visibility: 'hidden' }" />
    </div>

    <div class="columns m-0" :style="{
      backgroundColor: 'white',
      position: 'relative',
      zIndex: 20,
    }">
      <section class="leftbar column is-narrow is-hidden-mobile px-20 py-30">
        <left-bar/>
      </section>
      <section class="main column px-0 pb-20" :class="{'with-bookmarks': $store.state.ui.bookmarksOpen}">
        <Popups />
        <Confirm />
        <Prompt />
        <Alert />
        <router-view/>
      </section>
      <section v-if="$store.state.ui.bookmarksOpen" class="bookmarks column">
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
  min-height: 100%;
}
</style>

<style lang="scss" scoped>
@import '@/assets/main.scss';

.leftbar {
  height: 100%;
  min-height: 100vh;
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
  margin-right: $rightbar-width;
  height: 100%;

  @include until($tablet) {
    margin-left: 0px;
    margin-right: 0px;
    margin-top: 40px;
    margin-bottom: $mobile-footer-height;
  }
}

.main {
  padding-top: 30px;
  margin-right: $rightbar-width;
  z-index: 1;

  &.with-bookmarks {
    border-right: solid 1px $atw-base;
    margin-right: 0.75rem;
  }

  @include until($tablet) {
    margin-left: 0px;
    margin-right: 0px;
    margin-top: 20px;
    margin-bottom: $mobile-footer-height;

    &.with-bookmarks {
      display: none;
    }
  }

  @include from($tablet) {
    border-left: solid 1px $atw-base;
  }
}
</style>
