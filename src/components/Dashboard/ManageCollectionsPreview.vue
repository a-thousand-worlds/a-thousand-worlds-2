<script>
import BundlesLayoutIcon from '@/assets/icons/bundles-layout.svg'
import Square from '@/components/Square'

export default {
  components: {
    BundlesLayoutIcon,
    Square,
  },
  computed: {
    bookSubmissions() {
      return Object.values(this.$store.state.books?.data)
    },
    bundleSubmissions() {
      return Object.values(this.$store.state.bundles?.data)
    },
    peopleSubmissions() {
      return Object.values(this.$store.state.people?.data)
    }
  },
}

</script>

<template>
  <div class="columns">
    <div class="column">
      <router-link :to="{ name: 'BooksManager' }">
        <Square color="primary" style="color: black !important;">
          <h3>Books ({{ bookSubmissions.length }})</h3>
        </Square>
      </router-link>
    </div>
    <div class="column">
      <router-link :to="{ name: 'PeopleManager' }">
        <Square color="primary" style="color: black !important; border-radius: 999px;">
          <h3>People ({{ Object.keys(peopleSubmissions).length }})</h3>
        </Square>
      </router-link>
    </div>
    <div class="column">
      <router-link :to="{ name: 'BundlesManager' }">
        <Square color="primary" style="color: black !important;">
          <BundlesLayoutIcon style="position: absolute; opacity: 0.1; width: 90%; height: 100%;" />
          <!-- position: relative so text covers the BundlesLayoutIcon -->
          <h3 style="position: relative">Bundles ({{ bundleSubmissions.length }})</h3>
        </Square>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/style/mixins.scss';

h3:hover {
  color: white;
}
</style>
