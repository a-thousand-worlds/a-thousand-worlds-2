<script>
import TagsTable from '@/components/TagsTable'

export default {
  name: 'TagsManagerPage',
  components: {
    TagsTable,
  },
  data() {
    return {
      active: 'books'
    }
  },
  methods: {
    setActive(value) {
      this.active = value
    },
  },
}

</script>

<template>

  <div class="m-20 is-flex is-justify-content-center">
    <div class="is-flex-grow-1 mx-20" style="max-width: 760px;">

      <div class="mb-5">
        <router-link :to="{ name: 'Dashboard' }" class="is-uppercase is-primary">&lt; Back to Dashboard</router-link>
      </div>

      <h1 class="title divider-bottom mb-30">Tags Manager</h1>

      <div class="tabs">
        <ul>
          <li :class="{ 'is-active': active === 'books' }"><a @click.prevent="setActive('books')">Books</a></li>
          <li :class="{ 'is-active': active === 'bundles' }"><a @click.prevent="setActive('bundles')">Bundles</a></li>
          <li :class="{ 'is-active': active === 'people' }"><a @click.prevent="setActive('people')">People</a></li>
        </ul>
      </div>

      <TagsTable :type="active" />

    </div>
  </div>

</template>

<style lang="scss">
@import "bulma/sass/utilities/controls.sass";
@import "bulma/sass/utilities/extends.sass";
@import "bulma/sass/elements/table.sass";
@import "bulma/sass/form/shared.sass";
@import "bulma/sass/form/checkbox-radio.sass";
@import '@/assets/style/tabs.scss';
</style>
