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
      return this.getPending(this.$store.state.submissions.books?.data)
    },
    bundleSubmissions() {
      return this.getPending(this.$store.state.submissions.bundles?.data)
    },
    peopleSubmissions() {
      return this.getPending(this.$store.state.submissions.people?.data)
    }
  },
  methods: {
    /** Gets the values of all records that do not have an approvedAt timestamp. */
    getPending(data) {
      return Object.values(data || {})
        .filter(sub => sub && !sub.approvedAt)
    }
  }

}

</script>

<template>
  <div class="columns">
    <div class="column">
      <router-link :to="{ name: 'ReviewSubmissions', params: { type: 'books' } }">
        <Square>
          <h3>Books ({{ bookSubmissions.length }})</h3>
        </Square>
      </router-link>
    </div>
    <div class="column">
      <router-link :to="{ name: 'ReviewSubmissions', params: { type: 'people' } }">
        <Square style="border-radius: 999px;">
          <h3>People ({{ Object.keys(peopleSubmissions).length }})</h3>
        </Square>
      </router-link>
    </div>
    <div class="column">
      <router-link :to="{ name: 'ReviewSubmissions', params: { type: 'bundle' } }">
        <Square>
          <BundlesLayoutIcon class="fill-primary" style="position: absolute; opacity: 0.1; width: 90%; height: 100%;" />
          <h3>Bundles ({{ bundleSubmissions.length }})</h3>
        </Square>
      </router-link>
    </div>
  </div>
</template>
