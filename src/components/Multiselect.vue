<script>
import Tag from '@/components/Tag'

/** A generic multiselect dropdown menu. */
export default {
  components: {
    Tag,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    // options that should be selected in the dropdown by id
    selected: {
      type: Array,
      validator: arr => Array.isArray(arr) && arr.every(option => option.id),
    },
  },
  emits: ['select'],
  data() {
    return {
      dropdownActive: false,
    }
  },
  computed: {
    // convert the selected options to an id object that can be looked up in O(1)
    selectedIds() {
      return this.selected?.reduce((accum, option) => ({
        ...accum,
        [option.id]: true,
      }), {}) || {}
    },
  },
  methods: {

    // function declaration needed for v-click-outside
    closeDropdown() {
      this.dropdownActive = false
    },

    /** Emits the select event with the selected option. */
    select(option) {
      this.closeDropdown()
      this.$emit('select', { option, value: !this.selectedIds[option.id] })
    },

  },
}
</script>

<template>

  <span>

    <!-- dropdown -->
    <div class="dropdown mt-4 no-user-select" :class="{ 'is-active': dropdownActive }" style="text-align: left;">
      <div id="dropdown-menu" class="dropdown-menu" role="menu">
        <div class="dropdown-content" style="max-height: 19.5em; overflow: scroll;">
          <a v-for="option in options" :key="option.id" @click.prevent="select(option)" :class="{ 'ml-20': option.parent }" class="dropdown-item is-capitalized" :style="{ color: !selectedIds[option.id] ? '#000' : null }">
            {{ option.tag }}
          </a>
        </div>
      </div>
    </div>

    <!-- add tag -->
    <Tag :tag="{ tag: label }" nolink tagStyle="background-color: #fff; border-color: #000; color: #000 !important; cursor: pointer" v-click-outside="closeDropdown" @click="dropdownActive = !dropdownActive" />

  </span>

</template>

<style lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/components/dropdown.sass";
@import '@/assets/style/vars.scss';
@import '@/assets/style/mixins.scss';

hr.dropdown-divider {
  background-color: #ccc;
}

.add-tag {

  span, a {
    color: #000;
  }

  &.button.is-primary.nolink:hover {
    @include primary(background-color, !important);
    @include primary(border-color, !important);
    & span {
      color: #fff !important;
    }
  }
}
</style>
