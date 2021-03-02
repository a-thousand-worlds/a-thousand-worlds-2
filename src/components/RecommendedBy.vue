<script>
import engagements from '@/store/constants/engagements'
import ContributorProfileForm from '@/components/Dashboard/ContributorProfileForm'

const newContributor = () => ({
  engagements: {},
  name: '',
  organization: '',
  organizationLink: '',
  personalWebsite: '',
})

export default {
  components: {
    ContributorProfileForm,
  },
  props: {
    // contributor id
    modelValue: {
      type: String,
    },
    edit: {
      type: Boolean,
    },
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

    contributors() {
      return this.$store.state.users.loaded
        ? Object.entries(this.$store.state.users.data)
          .filter(([id, user]) => user.roles?.contributor)
          .map(([id, user]) => ({ id, ...user }))
        : []
    },

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
      return this.profile?.affiliations?.organizationLink
    },

    personalWebsite() {
      return this.profile?.affiliations?.personalWebsite
    }

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

    update(contributor) {
      this.closeDropdown()
      this.$emit('update:modelValue', contributor.id)
    },

  },
}
</script>

<template>

  <!-- ensure there is enough room below Recommended By for the dropdown -->
  <div :style="edit ? 'margin-bottom: 150px;' : null">

    <div v-if="!showNewContributor">
      <b>
        <a v-if="edit" v-click-outside="closeDropdown" @click.prevent.stop="dropdownActive = !dropdownActive" style="user-select: none;" :class="{ 'primary-hover': edit, 'is-primary': dropdownActive }">– RECOMMENDED BY </a>
        <span v-else>– RECOMMENDED BY </span>
      </b>

      <!-- dropdown -->
      <div v-if="edit" class="dropdown no-user-select" :class="{ 'is-active': dropdownActive }" style="position: absolute;">
        <div id="dropdown-menu" class="dropdown-menu" role="menu">
          <div class="dropdown-content" style="max-height: 19.5em; overflow: scroll;">
            <a class="dropdown-item is-capitalized" @click.prevent="showNewContributor = true"><b>NEW CONTRIBUTOR</b></a>
            <hr class="dropdown-divider">
            <a v-for="contributor in contributors" :key="contributor.id" class="dropdown-item is-capitalized" :class="{ 'is-active': contributor.id === modelValue }" @click.prevent="update(contributor)">
              {{ contributor.profile.name }}
            </a>
          </div>
        </div>
      </div>

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
