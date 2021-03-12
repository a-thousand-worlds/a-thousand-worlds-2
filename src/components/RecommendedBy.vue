<script>
import _ from 'lodash'
import engagements from '@/store/constants/engagements'
import normalizeLink from '@/util/normalizeLink'
import ContributorProfileForm from '@/components/Dashboard/ContributorProfileForm'

const newContributor = () => ({
  engagements: {},
  name: '',
  organization: '',
  organizationLink: '',
  website: '',
})

export default {
  components: {
    ContributorProfileForm,
  },
  props: {

    // contributor id
    modelValue: String,

    // if true, allows the contribor to be edited
    edit: Boolean,

    // if true, hides the "RECOMMENDED BY" text
    nolabel: Boolean,

  },
  emits: ['update:modelValue'],
  data() {
    return {
      dropdownActive: false,
      newContributor: newContributor(),
      showNewContributor: false,
    }
  },
  computed: {

    // sorted contributor for dropdown menu
    // accessible by admin only
    // unauthorized users must access contributors individually
    contributors() {
      const contributorList = this.$store.state.users.loaded
        ? Object.entries(this.$store.state.users.data)
          .filter(([id, user]) => user.roles?.contributor)
          .map(([id, user]) => ({ id, ...user }))
        : []
      return _.sortBy(contributorList, 'profile.name')
    },

    // populated individually in the created hook since users are not loaded automatically except for admin
    profile() {
      return this.modelValue && this.$store.state.users.loaded
        ? this.$store.state.users.data[this.modelValue]?.profile
        : null
    },

    name() {
      if (!this.profile) return ''
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
      return normalizeLink(this.profile?.affiliations?.organizationLink || '')
    },

    website() {
      return normalizeLink(this.profile?.affiliations?.website || '')
    }

  },
  created() {
    // load contributor
    // not subscribed to firebase, but will reload
    this.$store.dispatch('users/loadOne', this.modelValue)
  },
  methods: {

    createNewContributor(newContributor) {
      newContributor.then(contributor => {
        this.update(contributor)
        this.resetNewContributorForm()
      })
    },

    // function declaration needed for v-click-outside
    closeDropdown() {
      this.dropdownActive = false
    },

    resetNewContributorForm() {
      this.newContributor = newContributor()
      this.showNewContributor = false
    },

    remove() {
      this.closeDropdown()
      this.$emit('update:modelValue', null)
    },

    update(contributor) {
      this.closeDropdown()
      this.$emit('update:modelValue', contributor.id)
    },

  },
}
</script>

<template>

  <!-- ensure there is enough room below Recommended By for the dropdown -->
  <div v-if="edit || name" :style="edit ? 'margin-bottom: 150px;' : null">

    <div v-if="!showNewContributor">
      <b v-if="!nolabel">
        <a v-if="edit" v-click-outside="closeDropdown" @click.prevent.stop="dropdownActive = !dropdownActive" style="user-select: none;" :class="{ 'primary-hover': edit, 'is-primary': dropdownActive }">– RECOMMENDED BY </a>
        <span v-else>– RECOMMENDED BY </span>
      </b>

      <!-- dropdown -->
      <div v-if="edit" class="dropdown no-user-select" :class="{ 'is-active': dropdownActive }" style="position: absolute;">
        <div id="dropdown-menu" class="dropdown-menu" role="menu" style="top: auto; bottom: -1.5rem;">
          <div class="dropdown-content" style="max-height: 19.5em; overflow: scroll;">
            <a class="dropdown-item is-capitalized is-uppercase" @click.prevent="showNewContributor = true"><b>New Contributor</b></a>
            <a class="dropdown-item is-capitalized is-uppercase" @click.prevent="remove">None</a>
            <hr class="dropdown-divider">
            <a v-for="contributor in contributors" :key="contributor.id" class="dropdown-item is-capitalized" :class="{ 'is-active': contributor.id === modelValue }" @click.prevent="update(contributor)">
              {{ contributor.profile.name }}
            </a>
          </div>
        </div>
      </div>

      <!-- name -->
      <span v-if="name">
        <a v-if="website" :href="website" target="_blank" class="primary-hover"><u>{{ name }}</u></a>
        <span v-else>{{ name }}</span>
      </span>
      <i v-else style="opacity: 0.5;">None</i>

      <!-- title -->
      <span v-if="title">, {{ title }}</span>

      <!-- organization -->
      <span v-if="organization">
        <a v-if="organizationLink" :href="organizationLink" target="_blank" class="primary-hover">, <u>{{ organization }}</u></a>
        <i v-else>, {{ organization }}</i>
      </span>
    </div>

    <!-- New Contributor -->
    <div v-else style="max-width: 450px;">
      <h2 class="divider-bottom">New Contributor</h2>
      <ContributorProfileForm admin @cancel="resetNewContributorForm" @save="createNewContributor" />
    </div>

  </div>
</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/components/dropdown.sass";
@import '@/assets/style/vars.scss';

.required {
  position: absolute;
}

.field {
  margin-bottom: 30px;
}

label {
  text-transform: uppercase;
}

</style>
