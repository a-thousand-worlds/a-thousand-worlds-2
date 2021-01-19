<script>
import PersonCard from '@/components/PersonCard'
import Filter from '../components/Filter.vue'

export default {
  components: {
    PersonCard,
    Filter,
  },
  computed: {
    people() {
      return this.$store.getters['creators/filtered']
    },
    filters() {
      return Object.values(this.$store.state.creators.filters)
    },
  },
}

</script>

<template>

  <teleport to="#people-filter-menu">
    <Filter type="people" />
  </teleport>

  <div class="container is-flex is-flex-direction-row is-flex-wrap-wrap mx-20 mb-60">
    <div v-for="person of people" :key="person.id" :class="{ 'with-bookmarks': $store.state.ui.bookmarksOpen }" class="has-text-centered person-block p-3">
      <PersonCard :person="person" />
    </div>
  </div>

</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";

.person-block {
  width: 50%;
  margin: 0 25% 20px;

  @include from($tablet) {
    margin-left: 0;
    margin-right: 0;
  }
  @include from($desktop) { width: 33%; }
  @include from($widescreen) { width: 25%; }

  &.with-bookmarks {
    width: 100%;
    @include from($desktop) { width: 50%; }
    @include from($widescreen) { width: 33%; }
  }
}

</style>
