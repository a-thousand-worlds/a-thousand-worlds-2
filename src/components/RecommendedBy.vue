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

    profile() {
      return this.id && this.$store.state.users.loaded
        ? this.$store.state.users.data[this.id]?.profile
        : null
    },

    name() {
      return this.profile.name || (this.profile.firstName ? `${this.profile.firstName || ''} ${this.profile.lastName || ''}` : 'anonymous')
    },

    title() {
      const recommenderEngagements = this.profile?.affiliations?.selectedEngagementCategories
        ? Object.keys(this.profile.affiliations.selectedEngagementCategories)
          .map(id => engagements.find(engagement => engagement.id === id))
          .filter(x => x)
        : null
      return recommenderEngagements
        ? recommenderEngagements.map(engagement => engagement.text).join(', ')
        : null
    },

    organization() {
      return this.profile?.affiliations?.organization
    },

    organizationLink() {
      return this.profile?.affiliations?.organizationLink
    },

    personalWebsite() {
      return this.profile?.affiliations?.personalWebsite
    }

  }
}
</script>

<template>
  <p>
    <b>– RECOMMENDED BY </b>

    <!-- name -->
    <u>
      <a v-if="personalWebsite" :href="personalWebsite" target="_blank" class="primary-hover">{{ name }}</a>
      <span v-else>{{ name }}</span>
    </u>

    <!-- title -->
    <span v-if="title">, {{ title }}</span>

    <!-- organization -->
    <span v-if="organization">
      <a v-if="organizationLink" :href="organizationLink" target="_blank" class="primary-hover">, <u>{{ organization }}</u></a>
      <i v-else>, {{ organization }}</i>
    </span>

  </p>
</template>
