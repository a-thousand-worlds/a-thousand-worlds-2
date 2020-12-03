<script>
export default {
  methods: {
    toggleFilter(fid) {
      console.log('toggle filter: ', fid)
      this.$store.commit('toggleFilter', fid)
    },
    resetFilters() {
      this.$store.commit('resetFilters')
    },
    filterOn(fid) {
      return this.$store.state.filters.includes(fid)
    }
  }
}
</script>

<template>
  <aside class="menu px-3 mb-5">
    <ul class="menu-list submenu">
      <li v-for="filter in $store.state.sortedTags" :key="filter.id" @click="toggleFilter(filter.tag)">
        <button v-if="filter.showOnFront" :class="{toggled:filterOn(filter.tag)}" class="p-1">{{filter.tag}}</button>
      </li>
    </ul>
    <button class="button is-rounded" @click.prevent="resetFilters">Reset Filters</button>
  </aside>
</template>

<style scoped lang="scss">
@import '@/assets/vars.scss';

a {
  text-transform: uppercase;
}

.submenu {
  border-left: 0;
  padding: 0;
  width: 100%;
  margin: 0;
  margin-bottom: 20px;
  word-break: break-word;
  //background: linear-gradient(to bottom, $atw-base, $atw-spin);

  button {
    width: 100%;
    border: 0;
    background: #fff;
    font-family: 'Gotham SSm', Helvetica, Arial, sans-serif;
    font-size: 120%;
    text-align: left;

    &.toggled {
      border: 4px solid #333;
    }
  }
}
</style>
