<script>
import engagements from '@/store/constants/engagements'

export default {

  props: {
    id: {
      required: true,
      type: String,
    }
  },
  computed: {

    recommender() {
      const profile = this.id && this.$store.state.users.loaded
        ? this.$store.state.users.data[this.id]?.profile
        : null
      if (!profile) return null

      const name = profile.name || (profile.firstName ? `${profile.firstName || ''} ${profile.lastName || ''}` : 'anonymous')
      const recommenderEngagements = profile.affiliations.selectedEngagementCategories
        ? Object.keys(profile.affiliations.selectedEngagementCategories)
          .map(id => engagements.find(engagement => engagement.id === id))
          .filter(x => x)
        : null
      const title = recommenderEngagements
        ? recommenderEngagements.map(engagement => engagement.text).join(', ')
        : null
      const organization = profile.affiliations.organization
      return {
        name,
        title,
        organization,
      }
    },

  }
}
</script>

<template>
  <p>
    <b>– RECOMMENDED BY</b> <u>{{ recommender.name }}</u>{{ recommender.title ? `, ${recommender.title}` : '' }}<i>{{ recommender.organization ? `, ${recommender.organization}` : '' }}</i>
  </p>
</template>
