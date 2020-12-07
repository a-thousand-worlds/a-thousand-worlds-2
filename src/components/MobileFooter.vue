<script>

export default {
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

  <section class="mobile-footer">
    <div class="is-flex is-flex-direction-row is-justify-content-space-around">
      <div v-if="isFront" class="has-text-centered">
        <div @click.stop="showFilters=!showFilters" class="icon-button">
          <i class="fas fa-filter"></i>
          <div class="caption">Filter</div>
        </div>
      </div>
      <div class="has-text-centered">
        <router-link :to="{name: 'Home'}" class="icon-button">
          <i class="fas fa-book"></i>
          <div class="caption">Books</div>
        </router-link>
      </div>
      <div class="has-text-centered">
        <router-link :to="{name: 'Bundles'}" class="icon-button">
          <i class="fas fa-boxes"></i>
          <div class="caption">Bundles</div>
        </router-link>
      </div>
      <div class="has-text-centered">
        <div class="icon-button">
          <i class="fas fa-bookmark"></i>
          <div class="caption">Saved Items</div>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<style lang="scss" scoped>
@import '@/assets/vars.scss';

.mobile-filters {
  border-top: 1px solid $atw-base;
  position: fixed;
  bottom: 74px;
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

.mobile-footer {
  border-top: 1px solid $atw-base;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 74px;
  z-index: 3;
  background: #fff;
  padding-top: 11px;
}

.icon-button {
  border: none;
  background: none;
}

i {
  fonx-size: 33px;
}

.caption {
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 400;
}

a {
  color: #4a4a4a;
}
</style>
