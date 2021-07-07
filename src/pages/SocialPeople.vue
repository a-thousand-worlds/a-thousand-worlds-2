<script>
import reverse from 'lodash/reverse'
import sortBy from 'lodash/sortBy'
import StaticCoverImage from '@/components/StaticCoverImage'

export default {
  name: 'SocialPeople',
  components: {
    StaticCoverImage,
  },
  computed: {
    people() {
      return reverse(sortBy(this.$store.getters['people/list'](), 'createdAt'))
    },
  },
}

</script>

<template>

  <div style="column-count: 10; line-height: 0;">
    <StaticCoverImage v-for="person of people" :item="person" :key="person.id" style="width: 10.2vw; padding: 0; margin: 0; min-width: 0; min-height: 0; max-width: none; max-height: none;" />
  </div>

</template>
