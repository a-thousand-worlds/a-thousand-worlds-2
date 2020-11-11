<script>
export default {
  data() {
    return {
      filters: ['Board Book','Picture Book','Fiction']
    }
  },
  methods: {
    toggleFilter(filter)
    {
      console.log('toggle filter: ',filter)
    }
  },
  created()
  {
    console.log(this.$router)
  }
}
</script>

<template>
  <aside class="menu px-3">
    <ul class="menu-list submenu">
      <li v-for="filter in filters" :key="filter" @click="toggleFilter(filter)">
        <button class="p-1">{{filter}}</button>
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
