<script>
import * as slugify from '@sindresorhus/slugify'

export default {
  props: {
    type: {
      type: String,
      required: true,
      validator: value => ['books', 'bundles', 'people'].indexOf(value) !== -1,
    }
  },
  computed: {
    filters() {
      return Object.values(this.$store.state[this.storeType].filters)
    },
    // map the prop type to the router type
    routerType() {
      return this.type === 'books' ? 'Home'
        : this.type === 'people' ? 'People'
        : this.type === 'bundles' ? 'Bundles'
        : null
    },
    // map the prop type to the store type
    storeType() {
      return this.type === 'people' ? 'creators' : this.type
    },
    tags() {
      return this.$store.getters[`tags/${this.type}/listSorted`]()
    },
  },
  methods: {
    toggleFilter(fid) {
      this.$store.commit(`${this.storeType}/toggleFilter`, fid)
      const tags = this.$store.state.tags[this.type].data
      const filters = this.$store.state[this.storeType].filters
      this.$router.replace({
        name: this.routerType,
        query: filters.length > 0 ? {
          filters: filters.map(fid => slugify(tags[fid].tag)).join(',')
        } : null
      })
    },
    resetFilters() {
      this.$store.commit(`${this.storeType}/resetFilters`)
      this.$router.replace({ name: this.routerType })
    },
    isFiltered(fid) {
      return this.$store.state[this.storeType].filters.includes(fid)
    },
  }
}
</script>

<template>
  <aside v-if="tags.length" class="menu mb-5">
    <ul class="menu-list submenu">
      <li v-for="filter in tags" :key="filter.id" @click="toggleFilter(filter.id)">
        <button v-if="filter.showOnFront" :class="{toggled:isFiltered(filter.id)}" class="pb-2" style="padding-left: 2px;">{{ filter.tag }}<span v-if="isFiltered(filter.id)" class="remove-tag">{{ '—' }}</span></button>
      </li>
    </ul>
    <button v-if="filters.length > 0" class="button is-rounded is-primary" @click.prevent="resetFilters">Reset Filter</button>
  </aside>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/style/mixins.scss';
@import '@/assets/style/vars.scss';

a {
  text-transform: uppercase;
}

.menu-list.submenu {
  font-size: 10px;
  border-left: 0;
  padding: 0;
  width: 100%;
  margin: 0;
  margin-top: -10px;
  margin-bottom: 0.5rem;
  word-break: break-word;

  button {
    position: relative;
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
      @include primary(color);
      border: 0;
    }
  }
}

.button {
  font-size: 10px;
}

.remove-tag {
  @include primary(background-color);
  color: $primary-invert;
  display: inline-block;
  border-radius: 99px;
  width: 15px;
  height: 15px;
  margin-left: 5px;
  text-align: center;
  position: absolute;
  top: 0;
}

</style>
