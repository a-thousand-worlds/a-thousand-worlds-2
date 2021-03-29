<script>
import Filter from '../components/Filter.vue'
import Loader from '@/components/Loader'
import PersonCard from '@/components/PersonCard'

export default {
  components: {
    Filter,
    Loader,
    PersonCard,
  },
  beforeRouteLeave(to, from, next) {
    // mark the user's visit once they navigate to any other page
    // used to show the one-time welcome messagein App.vue
    if (!this.$store.state.ui.lastVisited) {
      this.$store.commit('ui/setLastVisited', new Date())
    }
    next()
  },
  computed: {
    people() {
      return this.$store.getters['people/filtered']
    },
    filters() {
      return Object.values(this.$store.state.people.filters)
    },
    loading() {
      return !this.$store.state.people.loaded || !this.$store.state.tags.people.loaded
    },
    peopleTags() {
      return this.$store.state.tags.people.data
    },
  },
  watch: {
    peopleTags(next, prev) {
      // load filters from url when tags/people are first loaded
      if (Object.keys(prev).length === 0 && Object.keys(next).length > 0) {
        this.$store.dispatch('people/setFiltersFromUrl', 'people')
      }
    }
  },
  methods: {
    resetFilter() {
      this.$store.dispatch('people/resetFilters')
    },
  },
}

</script>

<template>

  <teleport to="#people-filter-menu">
    <Filter type="people" />
  </teleport>

  <div v-if="loading" class="has-text-centered" style="margin-top: 20vh;">
    <Loader />
  </div>

  <div v-else>
    <div v-if="filters.length && people.length === 0" class="my-50 has-text-centered">
      <h2 class="mb-20">No matching people</h2>
      <p><a @click.prevent="resetFilter" class="button is-rounded is-primary">Reset Filter</a></p>
    </div>

    <div class="container is-flex is-flex-direction-row is-flex-wrap-wrap mx-20 mb-60">

      <div v-for="person of people" :key="person.id" :class="{ 'with-bookmarks': $store.state.ui.bookmarksOpen }" class="has-text-centered person-block p-3">
        <PersonCard :person="person" />
      </div>
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
