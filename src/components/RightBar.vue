<script>
import BookmarkIcon from '../assets/icons/bookmark.svg'

export default {
  components: {
    BookmarkIcon,
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
          <i class="fas fa-th-large fa-2x"></i>
          <span class="covers">Covers</span>
        </a>
      </li>
      <li>
        <a :class="{disabled:$store.state.viewMode==='list'}" @click.prevent="toggleViewMode('list')" href="#">
          <i class="fas fa-list fa-2x"></i>
          <span class="list">List</span>
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

  &.disabled {
    pointer-events: none;
    cursor: default;
    color: #ccc;
  }
  span {
    text-transform: uppercase;
    font-size: 80%;
    &.covers {
      margin-left: -6px;
    }
    &.list {
      margin-left: 4px;
    }
  }
}
</style>
