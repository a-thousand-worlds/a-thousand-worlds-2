<script>
import Tag from '@/components/Tag'

export default {
  components: {
    Tag,
  },
  props: {
    bookId: {
      type: String,
      required: true,
    }
  },
  emits: ['add'],
  data() {
    return {
      dropdownActive: false,
    }
  },
  computed: {
    tagOptions() {
      return this.$store.getters['tags/books/listSorted']()
    },
  },
  methods: {

    // function declaration needed for v-click-outside
    closeDropdown() {
      this.dropdownActive = false
    },

    /** Adds a tag to the book. */
    add(tagId) {
      this.closeDropdown()
      this.$emit('add', tagId)
      this.$store.dispatch('books/update', {
        path: `${this.book.id}/tags`,
        value: tagId,
      })
    },

  },
}
</script>

<template>

  <span>

    <!-- dropdown -->
    <div class="dropdown mt-4 no-user-select" :class="{ 'is-active': dropdownActive }">
      <div id="dropdown-menu" class="dropdown-menu" role="menu">
        <div class="dropdown-content" style="max-height: 19.5em; overflow: scroll;">
          <a v-for="tag in tagOptions" :key="tag.id" @click.prevent="add(tag.id)" :class="{ 'ml-20': tag.parent }" class="dropdown-item is-capitalized" style="color: #000;">
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
