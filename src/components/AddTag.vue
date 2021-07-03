<script>
import Tag from '@/components/Tag'

export default {
  components: {
    Tag,
  },
  props: {
    // tags that should be selected in the dropdown
    selected: {
      type: Array,
      validator: arr => Array.isArray(arr) && arr.every(tag => tag.id),
    },
    // type of tags: books, bundles, or people
    type: {
      type: String,
      required: true,
      validator: value => ['books', 'bundles', 'people'].includes(value),
    },
  },
  emits: ['add'],
  data() {
    return {
      dropdownActive: false,
    }
  },
  computed: {
    // convert the selected tags to an id object that can be looked up in O(1)
    selectedIds() {
      return this.selected?.reduce((accum, tag) => ({
        ...accum,
        [tag.id]: true,
      }), {}) || {}
    },
    tagOptions() {
      return this.$store.getters[`tags/${this.type}/listSorted`]()
    },
  },
  methods: {

    // function declaration needed for v-click-outside
    closeDropdown() {
      this.dropdownActive = false
    },

    /** Emits the add event with the selected tag. */
    add(tag) {
      this.closeDropdown()
      this.$emit('add', tag)
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
          <a v-for="tag in tagOptions" :key="tag.id" @click.prevent="add(tag)" :class="{ 'ml-20': tag.parent }" class="dropdown-item is-capitalized" :style="{ color: !selectedIds[tag.id] ? '#000' : null }">
            {{ tag.tag }}
          </a>
        </div>
      </div>
    </div>

    <!-- add tag -->
    <Tag :tag="{ tag: 'ADD TAG' }" nolink tagStyle="background-color: #fff; border-color: #000; color: #000 !important; cursor: pointer" v-click-outside="closeDropdown" @click="dropdownActive = !dropdownActive" />

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
