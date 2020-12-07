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
      showViewOptions: true
    }
  },
  watch: {
    '$route'(next) {
      this.showViewOptions = next.name === 'Home' || next.name === 'Bundles'
    }
  }
}
</script>

<template>
  <aside class="is-flex is-flex-direction-column is-justify-content-space-between has-text-centered" style="height: 100%;">

      <ul class="menu-list">
        <li><router-link :to="{name: 'Home'}">
          <BookmarkIcon/>
        </router-link></li>
      </ul>

      <ul v-if="showViewOptions" class="menu-list">
        <li>
          <a :class="{ active: $store.state.viewMode === 'covers' }" @click.prevent="toggleViewMode('covers')" href="#">
            <CoverViewIcon/>
            <span class="icon-label">Cover</span>
          </a>
        </li>
        <li class='my-30'>
          <a :class="{ active: $store.state.viewMode === 'list' }" @click.prevent="toggleViewMode('list')" href="#">
            <ListViewIcon/>
            <span class="icon-label">List</span>
          </a>
        </li>
      </ul>

  </aside>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

.menu-list a {

  padding: 0;

  .icon-label {
    text-transform: uppercase;
    font-size: 14px;
    font-weight: bold;
  }

  &.active {
    pointer-events: none;
    cursor: default;
    color: black;

    &.icon-label {
      color: #ccc;
    }
  }

}
</style>
