<script>
import BookmarkIcon from '@/assets/icons/bookmark.svg'
import BooksIcon from '@/assets/icons/books.svg'
import BundlesIcon from '@/assets/icons/bundles.svg'
import FilterIcon from '@/assets/icons/filter.svg'

export default {
  components: {
    BookmarkIcon,
    BundlesIcon,
    BooksIcon,
    FilterIcon,
  },
  data() {
    return {
      showFilters: false,
      isFront: true
    }
  },
  computed: {
    bookmarksCount() {
      return Object.keys(this.$store.state.user.user?.profile.bookmarks || {}).length
    }
  },
  watch: {
    '$route'(next) {
      this.isFront = next.name === 'Home'
    }
  },
  created() {
    this.isFront = this.$route.name === 'Home'
  },
  methods: {
    toggleFilter(fid) {
      this.$store.commit('toggleFilter', fid)
    },
    resetFilters() {
      this.$store.commit('resetFilters')
    },
    filterOn(fid) {
      return this.$store.state.filters.includes(fid)
    },
    clickOutsideFilters(e) {
      this.showFilters = false
    },
    toggleBookmarks() {
      if (!this.$iam('authorized')) {
        this.$router.push({ name: 'LogIn' })
        return
      }
      const state = this.$store.state.ui.bookmarksOpen
      this.$store.commit('ui/setBookmarksOpen', !state)
    }
  }
}
</script>

<template>
  <div>
    <section v-if="showFilters" v-click-outside="clickOutsideFilters" class="mobile-filters">
      <ul class="haas-text-centered">
        <li v-for="filter in $store.state.sortedTags" :key="filter.id" @click="toggleFilter(filter.tag)">
          <button v-if="filter.showOnFront" :class="{toggled:filterOn(filter.tag)}" class="p-1 filter">{{ filter.tag }}</button>
        </li>
      </ul>
      <button class="button is-rounded is-small mt-10" @click.prevent="resetFilters">Reset Filter</button>
    </section>

    <section class="mobile-bottom-nav has-text-centered is-uppercase">
      <ul class="menu-list my-10">

        <li v-if="isFront && !$store.state.ui.bookmarksOpen">
          <a :class="null" href="#" @click.stop="showFilters=!showFilters">
            <FilterIcon />
            <div class="icon-label mt-2">Filter</div>
          </a>
        </li>

        <li>
          <router-link :to="{ name: 'Home' }">
            <BooksIcon />
            <div class="icon-label mt-2">Books</div>
          </router-link>
        </li>

        <li>
          <router-link :to="{ name: 'Bundles' }">
            <BundlesIcon />
            <div class="icon-label mt-2">Bundles</div>
          </router-link>
        </li>

        <li>
          <a class="bookmark-toggler" href="#" @click.prevent="toggleBookmarks()">
            <BookmarkIcon class="fill-secondary" />
            <div class="icon-label mt-2">Saved Items</div>
            <span v-if="$iam('authorized')" class="badge">{{ bookmarksCount }}</span>
          </a>
        </li>

      </ul>

    </section>

  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/style/mixins.scss';
@import '@/assets/style/vars.scss';

.mobile-filters {
  @include primary(border-top-color);
  border-top: 1px solid;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
  background: #fff;
  padding: 10px 10px 110px 10px;

  button.filter {
    background: none;
    border: none;

    &.toggled {
      background: $lightgrey;
      border: 0;
    }
  }
}

.mobile-bottom-nav {
  @include primary(border-top-color);
  width: 100%;
  position: fixed;
  bottom: 0;
  border-top: solid 1px;
  background-color: white;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
  overflow: auto;

  .title {
    font-size: 20px;
    margin: 0;
  }

  .menu-list {

    // margin: auto better than justify-content: center here
    // https://stackoverflow.com/a/34455253/480608
    margin: auto;

    li {
      display: inline-block;
      width: 24%;
      min-width: 60px;
      max-width: 100px;
    }
  }
}

.bookmark-toggler {
  position: relative;

  .badge {
    position: absolute;
    top: -5px;
    right: 26px;
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

</style>
