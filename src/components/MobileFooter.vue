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
  created() {
    this.isFront = this.$route.name === 'Home'
  },
  watch: {
    '$route'(next) {
      this.isFront = next.name === 'Home'
    }
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
        // eslint-disable-next-line fp/no-mutating-methods
        this.$router.push({ name: 'LogIn' })
        return
      }
      const state = this.$store.state.bookmarksOpen
      this.$store.commit('setBookmarksOpen', !state)
    }
  }
}
</script>

<template>
<div>
  <section v-if="showFilters" v-click-outside="clickOutsideFilters" class="mobile-filters p-2">
    <ul class="haas-text-centered">
      <li v-for="filter in $store.state.sortedTags" :key="filter.id" @click="toggleFilter(filter.tag)">
        <button v-if="filter.showOnFront" :class="{toggled:filterOn(filter.tag)}" class="p-1 filter">{{filter.tag}}</button>
      </li>
    </ul>
    <button class="button is-rounded" @click.prevent="resetFilters">Reset Filter</button>
  </section>

  <section class="mobile-bottom-nav is-flex is-justify-content-center has-text-centered is-uppercase">
    <ul class="menu-list">

      <li v-if="isFront && !$store.state.bookmarksOpen" >
        <a :class="null" @click.stop="showFilters=!showFilters" href="#">
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
        <a :class="null" @click.prevent="toggleBookmarks()" href="#">
          <BookmarkIcon/>
          <div class="icon-label mt-2">Saved Items</div>
        </a>
      </li>

    </ul>

  </section>

</div>
</template>

<style lang="scss" scoped>
@import '@/assets/vars.scss';

.mobile-filters {
  border-top: 1px solid $atw-base;
  position: fixed;
  bottom: 95px;
  left: 0;
  width: 100%;
  height: auto;
  z-index: 2;
  background: #fff;
  padding-top: 11px;

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

</style>
