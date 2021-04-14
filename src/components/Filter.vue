<script>
import specialFilters from '@/store/constants/special-filters'

export default {
  props: {
    type: {
      type: String,
      required: true,
      validator: value => ['books', 'bundles', 'people'].indexOf(value) !== -1,
    }
  },
  data() {
    return {
      submenuActive: null,
    }
  },
  computed: {
    allTags() {
      return this.$store.getters[`tags/${this.type}/listSorted`]()
    },
    filters() {
      return Object.values(this.$store.state[this.type]?.filters || {})
    },
    // map the prop type to the router type
    routerType() {
      return this.type === 'books' ? 'Home'
        : this.type === 'people' ? 'People'
        : this.type === 'bundles' ? 'Bundles'
        : null
    },
    specialFilters() {
      return specialFilters[this.type]
    },
    tags() {
      // filter out subtags from main filter list
      return this.allTags.filter(tag => !tag.parent)
    },
  },
  methods: {
    closeSubmenu() {
      this.toggleSubmenu(null)
    },
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
    isFiltered(filter) {
      return this.$store.state[this.type]?.filters?.some(activeFilter =>
        activeFilter.id === filter.id && (!filter.submenu || activeFilter.submenu?.id === filter.submenu?.id)
      )
    },
    /** Returns true if a tag has subtags */
    isParent(tag) {
      return this.allTags.some(t => t.parent === tag.id)
    },
    resetFilters() {
      this.$store.dispatch(`${this.type}/resetFilters`)
      this.$router.replace({ name: this.routerType })
    },
    /** Sets custom offsets on the selection icon to vertically center it on long tags. */
    selectedIconStyle(name) {
      return name.toUpperCase().startsWith('ARAB/MIDDLE')
        ? { marginLeft: '6px', top: '11px' }
        : null
    },
    /** Gets all the subtags of a top-level tag. */
    subtags(tag) {
      return this.allTags.filter(t => t.showOnFront && t.parent === tag.id)
    },
    toggleSubmenu(value) {
      this.submenuActive = value !== this.submenuActive ? value : null
    },
    toggleFilter(filter) {
      this.$store.dispatch(`${this.type}/toggleFilter`, filter)
      // const tags = this.$store.state.tags[this.type].data
      // handle hardcoded special filters
      // const tagLabel = (this.specialFilters?.find(({ id }) => id === filter.id) || tags[filter.id]).tag
    },
  }
}
</script>

<template>
  <aside v-if="tags.length" class="menu mb-5">
    <ul class="menu-list submenu">

      <!-- special filters -->
      <li v-for="filter in specialFilters" :key="filter.id" @click="toggleFilter(filter)">
        <button :class="{ active: isFiltered(filter)}" class="pb-2" style="padding-left: 2px;">
          <span style="display: inline-block;" :innerHTML="formatTag(filter.tag)" />
          <span v-if="isFiltered(filter)" class="remove-tag" :style="selectedIconStyle(filter.tag)">{{ '—' }}</span></button>
      </li>

      <!-- filters -->
      <li v-for="filter in tags" :key="filter.id" @mouseenter="isParent(filter) && toggleSubmenu(filter)" @mouseleave="isParent(filter) && toggleSubmenu(null)" @click.stop="!isParent(filter) && toggleFilter(filter)" style="position: relative;">

        <button v-if="filter.showOnFront" :class="{ active: isFiltered(filter) || (isParent(filter) && submenuActive)}" class="pb-2" style="padding-left: 2px;">
          <span style="display: inline-block;" :innerHTML="formatTag(filter.tag)" />
          <span v-if="isFiltered(filter)" class="remove-tag" :style="selectedIconStyle(filter.tag)">{{ '—' }}</span></button>

        <!-- subtags -->
        <div v-if="submenuActive && isParent(filter)" v-click-outside="closeSubmenu" class="subtag-menu p-2" style="position: absolute; z-index: 1; background-color: #fff; top: -5px; left: 80px; min-width: 168px;">
          <div v-for="subtag of subtags(filter)" :key="subtag.id" @click="toggleFilter(subtag)">
            <button :class="{ active: isFiltered(subtag) }" class="pb-2" style="padding-left: 2px;">
              <span style="display: inline-block;" :innerHTML="subtag.tag" />
              <span v-if="isFiltered(subtag)" class="remove-tag">{{ '—' }}</span></button>
          </div>

        </div>

      </li>

    </ul>
    <button v-if="filters.length > 0" class="button is-rounded is-primary" @click.prevent="resetFilters">Reset Filter</button>
  </aside>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/elements/box.sass";
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

.subtag-menu {
  @include secondary(border-color);
  border: solid 1px;
  box-shadow: $box-shadow;
}

</style>
