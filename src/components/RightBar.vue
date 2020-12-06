<script>
import BookmarkIcon from '../assets/icons/bookmark.svg'
import CoverViewIcon from '../assets/icons/cover-view.svg'
import ListViewIcon from '../assets/icons/list-view.svg'

export default {
  components: {
    BookmarkIcon,
    CoverViewIcon,
    ListViewIcon,
  },
  methods: {
    toggleViewMode(mode) {
      this.$store.commit('setViewMode', mode)
    }
  },
  data() {
    return {
      showTogglers: true
    }
  },
  watch: {
    '$route'(next) {
      if (next.name === 'Home' || next.name === 'Bundles') {
        this.showTogglers = true
      }
      else {
        this.showTogglers = false
      }
    }
  }
}
</script>
<template>
<aside class="is-flex is-flex-direction-column is-justify-content-space-between">
    <ul class="menu-list">
      <li><router-link :to="{name: 'Home'}">
        <BookmarkIcon/>
      </router-link></li>
    </ul>
    <ul v-if="showTogglers" class="menu-list">
      <li>
        <a :class="{disabled:$store.state.viewMode==='covers'}" @click.prevent="toggleViewMode('covers')" href="#">
          <CoverViewIcon/>
          <span class="icon-label">Cover</span>
        </a>
      </li>
      <li class='my-30'>
        <a :class="{disabled:$store.state.viewMode==='list'}" @click.prevent="toggleViewMode('list')" href="#">
          <ListViewIcon/>
          <span class="icon-label">List</span>
        </a>
      </li>
    </ul>

</aside>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

aside {
  height: 100%;
}

.menu-list a {

  padding: 0;
  text-align: center;

  .icon-label {
    text-transform: uppercase;
    font-size: 14px;
    font-weight: bold;
  }

  &.disabled {
    pointer-events: none;
    cursor: default;
    color: black;

    &.icon-label {
      color: #ccc;
    }
  }

}
</style>
