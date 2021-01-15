<script>
import Groups from '@/components/ReviewSubmissions/Groups'

export default {
  name: 'ReviewSubmissions',
  components: {
    Groups,
  },
  computed: {
    label() {
      return this.type === 'books' ? 'Book'
        : this.type === 'bundles' ? 'Bundle'
        : this.type === 'people' ? 'People'
        : null
    },
    type() {
      return this.$route.params.type
    },
  }
}

</script>

<template>

  <div class="is-flex is-justify-content-center">
    <div class="is-flex-grow-1 mx-20" style="max-width: 760px;">

      <div class="mb-5">
        <router-link :to="{ name: 'Dashboard' }" class="is-uppercase is-primary">&lt; Back to Dashboard</router-link>
      </div>

      <h1 class="divider-bottom is-capitalized">Review {{ label }} Submissions</h1>
      <Groups :type="type" />
    </div>
  </div>

</template>
