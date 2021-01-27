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
  computed: {
    bookmarksCount() {
      return Object.keys(this.$store.state.user.user?.profile.bookmarks || {}).length
    },
    filters() {
      const ret = this.$store.state[this.filterType].filters
      return ret
    },
    showFilters() {
      return this.filterType
    },
    tags() {
      return this.$store.getters[`tags/${this.filterType}/listSorted`]()
        .filter(tag => tag.showOnFront)
    },
    filterType() {
      return this.$route.name === 'Home' || this.$route.name === 'BookDetail' ? 'books'
        : this.$route.name === 'People' || this.$route.name === 'PersonDetail' ? 'people'
        : this.$route.name === 'Bundles' || this.$route.name === 'BundleDetail' ? 'bundles'
        : null
    },
  },
  methods: {
    isFiltered(tag) {
      const filters = this.filters || []
      return filters.includes(tag)
    },
    resetFilters() {
      this.$store.commit(`${this.type}/resetFilters`)
    },
    setFilters(e) {
      const options = [...e.target.options]
      const selected = options
        // ignore reset option
        .filter(option => option.selected && option.value !== '_reset')
        .map(option => option.value)
      this.$store.commit(`${this.type}/setFilters`, selected)
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
    <!-- <button class="button is-rounded is-small mt-10" @click.prevent="resetFilters">Reset Filter</button> -->

    <section class="mobile-bottom-nav has-text-centered is-uppercase">
      <ul class="menu-list my-10">

        <li v-if="showFilters && !$store.state.ui.bookmarksOpen" style="position: relative;">
          <select @change="setFilters" multiple style="position: absolute; overflow: hidden; left: 0: top: 0; overflow: hidden; min-width: 60px; max-width: 100px; width: 70px; height: 100%; font-size: 20px; cursor: pointer; opacity: 0; text-transform: uppercase;">
            <!-- <option @click="resetFilters" value="_reset">Reset Filter</option> -->
            <optgroup disabled hidden />
            <option v-for="tag in tags" :key="tag.id" :selected="isFiltered(tag.id)" :value="tag.id">{{ tag.tag }}</option>
          </select>
          <FilterIcon />
          <div class="icon-label mt-2">Filter</div>
          <span v-if="filters?.length > 0" class="badge">{{ filters?.length }}</span>
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
          <a class="bookmark-toggler" href="#" @click.prevent="toggleBookmarks">
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

    a:hover, a:active, a:focus {
      background-color: transparent;
    }
  }
}

.bookmark-toggler {
  position: relative;
}

.badge {
  position: absolute;
  top: -5px;
  right: 25px;
  background: #000;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  width: 20px;
  height: 20px;
  line-height: 20px;
  border-radius: 10px;
}

</style>
