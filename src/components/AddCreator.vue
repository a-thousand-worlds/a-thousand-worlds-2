<script>
import _ from 'lodash'
import creatorTitles from '@/store/constants/creatorTitles'
import Tag from '@/components/Tag'

export default {
  components: {
    Tag,
  },
  props: {
  },
  emits: ['update'],
  data() {
    return {
      creatorTitles,
      dropdownActive: false,
    }
  },
  computed: {
    creators() {
      return this.$store.state.people.data
        ? _.sortBy(Object.values(this.$store.state.people.data), 'name')
        : null
    }
  },
  methods: {
    // function declaration needed for v-click-outside
    closeDropdown() {
      this.dropdownActive = false
    },
  },
}
</script>

<template>

  <div>

    <!-- dropdown -->
    <div class="dropdown mt-4 no-user-select" :class="{ 'is-active': dropdownActive }" style="text-align: left;">
      <div id="dropdown-menu" class="dropdown-menu" role="menu" style="margin-left: -10px;">
        <div class="dropdown-content" style="max-height: 19.5em; overflow: scroll;">

          <span class="dropdown-item">To add a creator that is not yet in the system, use the People Submission Form.</span>
          <hr class="dropdown-divider">

          <a v-for="creator in creators" :key="creator.id" class="dropdown-item is-capitalized" @click.prevent="$emit('update', creator.id)" style="color: #000;">
            {{ creator.name }}
          </a>

        </div>
      </div>
    </div>

    <!-- add -->
    <Tag :tag="{ tag: 'ADD CREATOR' }" nolink buttonClass="add-tag" tagStyle="border-color: #000; cursor: pointer;" v-click-outside="closeDropdown" @click.prevent.stop="dropdownActive = !dropdownActive" />

  </div>

</template>

<style lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/components/dropdown.sass";
@import '@/assets/style/vars.scss';

hr.dropdown-divider {
  background-color: #ccc;
}

.add-tag {
  background-color: #fff !important;

  & span {
    color: #000;
   }

  & a {
    color: #000;
  }

  &:hover {
    background-color: #000 !important;
    & span {
      color: #fff;
    }
  }
}
</style>