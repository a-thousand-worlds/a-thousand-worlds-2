<script>
export default {
  computed: {
    tags() {
      return this.$store.getters['tags/books/listSorted']()
    },
  },
  methods: {
    toggleFilter(fid) {
      this.$store.commit('books/toggleFilter', fid)
      // eslint-disable-next-line  fp/no-mutating-methods
      this.$router.push({ name: 'Home' })
    },
    resetFilters() {
      this.$store.commit('books/resetFilters')
    },
    filterOn(fid) {
      return this.$store.state.books.filters.includes(fid)
    },
  }
}
</script>

<template>
  <aside v-if="tags.length" class="menu mb-5">
    <ul class="menu-list submenu">
      <li v-for="filter in tags" :key="filter.id" @click="toggleFilter(filter.tag)">
        <button v-if="filter.showOnFront" :class="{toggled:filterOn(filter.tag)}" class="pb-2" style="padding-left: 2px;">{{ filter.tag }}<span v-if="filterOn(filter.tag)" class="remove-tag">{{ '—' }}</span></button>
      </li>
    </ul>
    <button class="button is-rounded is-primary" @click.prevent="resetFilters">Reset Filter</button>
  </aside>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";
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
  margin-top: -10px;
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
      color: $primary;
      border: 0;
    }
  }
}

.button {
  font-size: 10px;
}

.remove-tag {
  background-color: $primary;
  color: $primary-invert;
  display: inline-block;
  border-radius: 99px;
  width: 15px;
  height: 15px;
  margin: 0 -15px -10px 10px;
  text-align: center;
  position: relative;
  top: -2px;
}

</style>
