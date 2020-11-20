<script>
export default {
  methods: {
    toggleFilter(filter) {
      console.log('toggle filter: ', filter)
    }
  }
}
</script>

<template>
  <aside class="menu px-3">
    <ul class="menu-list submenu">
      <li v-for="filter in $store.state.sortedTags" :key="filter.id" @click="toggleFilter(filter.id)">
        <button v-if="filter.showOnFront" class="p-1">{{filter.tag}}</button>
      </li>
    </ul>
  </aside>
</template>

<style scoped lang="scss">
@import '@/assets/vars.scss';

a {
  //font-size: 150%;
  //font-weight: bold;
  text-transform: uppercase;
}

.submenu {
  border-left: 0;
  padding: 0;
  width: 100%;
  margin: 0;
  background: linear-gradient(to bottom, $atw-base, $atw-spin);

  button {
    width: 100%;
    border: 0;
    border-bottom: 2px solid #fff;
    background: transparent;
    color: #fff;
    font-family: 'Gotham SSm', Helvetica, Arial, sans-serif;
    font-size: 120%;
    text-align: left;
  }
}
</style>
