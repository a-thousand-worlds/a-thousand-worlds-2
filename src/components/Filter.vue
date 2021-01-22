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
      return Object.values(this.$store.state[this.type].filters)
    },
    // map the prop type to the router type
    routerType() {
      return this.type === 'books' ? 'Home'
        : this.type === 'people' ? 'People'
        : this.type === 'bundles' ? 'Bundles'
        : null
    },
    tags() {
      return this.$store.getters[`tags/${this.type}/listSorted`]()
    },
  },
  methods: {
    /** Adds manual <br> to long tags otherwise the inline-block elements will take up the full width and add unnecessary space before the selection icon. */
    formatTag(name) {
      if (name.length < 22) return name
      const firstSpace = name.indexOf(' ')
      if (firstSpace === -1) return name
      const secondSpace = name.indexOf(' ', firstSpace + 1)
      return firstSpace < 10 && secondSpace !== -1
        ? `${name.slice(0, secondSpace)}<br/>${name.slice(secondSpace)}`
        : `${name.slice(0, firstSpace)}<br/>${name.slice(firstSpace)}`
    },
    /** Sets custom offsets on the selection icon to vertically center it on long tags. */
    selectedIconStyle(name) {
      return name.toUpperCase().startsWith('ARAB/MIDDLE')
        ? { marginLeft: '6px', top: '11px' }
        : null
    },
    toggleFilter(fid) {
      this.$store.commit(`${this.type}/toggleFilter`, fid)
      const tags = this.$store.state.tags[this.type].data
      const filters = this.$store.state[this.type].filters
      this.$router.replace({
        name: this.routerType,
        query: filters.length > 0 ? {
          filters: filters.map(fid => slugify(tags[fid].tag)).join(',')
        } : null
      })
    },
    resetFilters() {
      this.$store.commit(`${this.type}/resetFilters`)
      this.$router.replace({ name: this.routerType })
    },
    isFiltered(fid) {
      return this.$store.state[this.type].filters.includes(fid)
    },
  }
}
</script>

<template>
  <aside v-if="tags.length" class="menu mb-5">
    <ul class="menu-list submenu">
      <li v-for="filter in tags" :key="filter.id" @click="toggleFilter(filter.id)">
        <button v-if="filter.showOnFront" :class="{ active: isFiltered(filter.id)}" class="pb-2" style="padding-left: 2px;">
          <span style="display: inline-block;" :innerHTML="formatTag(filter.tag)" />
          <span v-if="isFiltered(filter.id)" class="remove-tag" :style="selectedIconStyle(filter.tag)">{{ '—' }}</span></button>
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
    text-transform: uppercase;

    &:focus, &:active {
      outline: 0;
    }

    &:hover, &.active  {
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
  line-height: 15px; // use line-height instead of height to vertically center the dash
  margin-left: 5px;
  text-align: center;
  position: absolute;
  top: -1px;
}

</style>
