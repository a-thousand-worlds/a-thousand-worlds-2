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
  <aside class="menu ml-3 mb-5">
    <ul class="menu-list submenu">
      <li v-for="filter in $store.state.sortedTags" :key="filter.id" @click="toggleFilter(filter.tag)">
        <button v-if="filter.showOnFront" :class="{toggled:filterOn(filter.tag)}" class="p-1">{{filter.tag}}</button>
      </li>
    </ul>
    <button class="button is-rounded" @click.prevent="resetFilters">Reset Filter</button>
  </aside>
</template>

<style scoped lang="scss">
@import '@/assets/vars.scss';

a {
  text-transform: uppercase;
}

.submenu {
  font-size: 10px;
  border-left: 0;
  padding: 0;
  width: 100%;
  margin: 0;
  margin-bottom: 0.5rem;
  word-break: break-word;
  //background: linear-gradient(to bottom, $atw-base, $atw-spin);

  button {
    cursor: pointer;
    width: 100%;
    border: 0;
    background: #fff;
    font-size: 10px;
    text-align: left;

    &:focus, &:active {
      outline: 0;
    }

    &.toggled {
      background: $lightgrey;
      border: 0;
    }
  }
}

.button {
  font-size: 10px;
}

</style>
