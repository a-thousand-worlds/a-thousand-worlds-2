<script>
import BundlesLayoutIcon from '@/assets/icons/bundles-layout.svg'

export default {
  components: {
    BundlesLayoutIcon,
  },
  computed: {
    bookSubmissions() {
      const subs = this.$store.state.submissions.books?.data || {}
      return Object.keys(subs)
        .filter(sid => !subs[sid]?.approvedAt)
        .map(sid => subs[sid])
    },
    bundleSubmissions() {
      const subs = this.$store.state.submissions.bundles?.data || {}
      return Object.keys(subs)
        .filter(sid => !subs[sid].approvedAt)
        .map(sid => subs[sid])
    },
    peopleSubmissions() {
      return this.$store.state.submissions.people?.data || {}
    }
  }

}

</script>

<template>
  <div class="columns">
    <div class="column">
      <router-link :to="{ name: 'ReviewSubmissions', params: { type: 'books' } }">
        <div class="square bg-secondary is-flex is-justify-content-center is-align-items-center">
          <h3 style="color: black;">Books ({{ bookSubmissions.length }})</h3>
        </div>
      </router-link>
    </div>
    <div class="column">
      <router-link :to="{ name: 'ReviewSubmissions', params: { type: 'people' } }">
        <div class="square bg-secondary is-flex is-justify-content-center is-align-items-center" style="border-radius: 999px;">
          <h3 style="color: black;">People ({{ Object.keys(peopleSubmissions).length }})</h3>
        </div>
      </router-link>
    </div>
    <div class="column">
      <router-link :to="{ name: 'ReviewSubmissions', params: { type: 'bundle' } }">
        <div class="square bg-secondary is-flex is-justify-content-center is-align-items-center">
          <BundlesLayoutIcon class="fill-primary" style="position: absolute; opacity: 0.1; width: 90%; height: 100%;" />
          <h3 style="position: relative; color: black;">Bundles ({{ bundleSubmissions.length }})</h3>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";

.square {
  position: relative;
  padding: 20px;
  white-space: nowrap;

  // shrink text on tablet
  // not mobile since the container becomes big again when stacked
  @include tablet-only {
    h3 {
      font-size: 20px;
    }
  }

}

.square:after {
  content: "";
  display: block;
  padding-bottom: 100%;
}

</style>
