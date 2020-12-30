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
  props: ['hideBookmarks'],
  methods: {
    toggleViewMode(mode) {
      this.$store.commit('ui/setViewMode', mode)
    },
    toggleBookmarks() {
      if (!this.$iam('authorized')) {
        // eslint-disable-next-line fp/no-mutating-methods
        this.$router.push({ name: 'LogIn' })
        return
      }
      const state = this.$store.state.ui.bookmarksOpen
      this.$store.commit('ui/setBookmarksOpen', !state)
    }
  },
  computed: {
    bookmarksCount() {
      return Object.keys(this.$store.state.user.user?.profile.bookmarks || {}).length
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

    <!-- div must remain when hiding for justify-content: space-between -->
    <div>
      <ul v-if="!hideBookmarks" class="menu-list">
        <li><a :href="null" class="bookmark-toggler" @click.prevent="toggleBookmarks()">
          <BookmarkIcon class="fill-secondary" />
          <span v-if="$iam('authorized')" class="badge">{{bookmarksCount}}</span>
        </a></li>
      </ul>
    </div>

    <ul v-if="showViewOptions" class="menu-list">
      <li>
        <a :class="{ active: $store.state.ui.viewMode === 'covers' }" @click.prevent="toggleViewMode('covers')" href="#">
          <CoverViewIcon />
          <span class="icon-label">Cover</span>
        </a>
      </li>
      <li class='my-30'>
        <a :class="{ active: $store.state.ui.viewMode === 'list' }" @click.prevent="toggleViewMode('list')" href="#">
          <ListViewIcon />
          <span class="icon-label">List</span>
        </a>
      </li>
    </ul>

  </aside>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

.bookmark-toggler {
  position: relative;

  .badge {
    position: absolute;
    top: -9px;
    right: 0px;
    background: #000;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    width: 20px;
    height: 20px;
    line-height: 20px;
    border-radius: 10px;
  }
}

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
