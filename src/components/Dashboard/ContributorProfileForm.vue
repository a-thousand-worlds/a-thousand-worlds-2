<script>
import validator from '@/mixins/validator'
import engagementOptions from '@/store/constants/engagements'

export default {
  mixins: [
    validator(function() {
      const hasIdentity = Object.values(this.identities).some(x => x)
      const hasSelectedEngagements = Object.values(this.affiliations.selectedEngagementCategories).some(x => x)
      return [
        ...!hasSelectedEngagements && !this.affiliations.otherEngagementCategory ? [{
          name: 'engagements',
          message: 'How you engage with books is required'
        }] : [],
        ...!this.affiliations.organization ? [{
          name: 'organizationName',
          message: 'Organization is required'
        }] : [],
        ...!hasIdentity && !this.otherIdentity ? [{
          name: 'identity',
          message: 'Identity is required'
        }] : [],
      ]
    })
  ],
  data() {
    const profile = this.$store.state.user.user?.profile
    return {
      affiliations: {
        organization: '',
        organizationLink: '',
        otherEngagementCategory: '',
        selectedEngagementCategories: {},
        ...profile?.affiliations,
      },
      disableAfterSave: false,
      engagementOptions,
      identities: profile?.identities ? { ...profile.identities } : {},
      loading: false,
      otherIdentity: null,
    }
  },
  computed: {

    identityOptions() {
      return this.$store.getters[`tags/people/listSorted`]()
        .filter(tag => tag.showOnContributorSignup)
    },

  },
  watch: {
    '$store.state.user.user'(next, prev) {
      this.identities = next?.profile?.identities || this.identities
    },
  },
  methods: {

    async saveProfile() {

      if (!this.validate()) return

      clearTimeout(this.messageTimeout)
      clearTimeout(this.disableAfterSaveTimeout)
      this.disableAfterSave = true

      this.loading = true

      await this.$store.dispatch('user/updateProfile', {
        identities: this.identities,
        affiliations: this.affiliations,
        otherIdentity: this.otherIdentity,
      })
        .then(() => {
          this.$store.dispatch('ui/popup', {
            text: 'Profile saved',
            type: 'success'
          })
        })

      this.disableAfterSaveTimeout = setTimeout(() => {
        this.disableAfterSave = false
      }, 1000)

    },
  },

}
</script>

<template>
  <div>
    <h2 class="field">Welcome! Let's start by getting the information that will be displayed with your book recommendations.</h2>

    <form class="is-flex-grow-1" @submit.prevent="saveProfile">

      <!-- engagement -->
      <div class="field">
        <label class="label is-uppercase" :class="{ error: hasError('engagements') }">How do you engage with books?<sup class="required">*</sup></label>
        <div class="sublabel tablet-columns-2">
          <div v-for="engagement of engagementOptions" :key="engagement.id" class="control columns-2">
            <input :id="`engagement-${engagement.id}`" v-model="affiliations.selectedEngagementCategories[engagement.id]" :name="engagement.id" @change="revalidate" type="checkbox" :false-value="null" class="checkbox mr-2 mb-3">
            <label class="label is-inline" style="word-wrap: nobreak;" :for="`engagement-${engagement.id}`">
              {{ engagement.text }}
            </label>
          </div>
          <div>
            <input v-model="affiliations.selectedEngagementCategories.other" id="engagement-other" type="checkbox" class="checkbox mr-2 mb-3" @change="revalitate">
            <label for="engagement-other" class="label is-inline">Other</label>
            <div>
              <input v-model="affiliations.otherEngagementCategory" @change="revalidate" class="input" style="max-width: 200px;" type="text">
            </div>
          </div>
        </div>

      </div>

      <!-- organization -->
      <div class="field">
        <label class="label is-uppercase" :class="{ error: hasError('organizationName') }">Are you affiliated with an organization?<sup class="required">*</sup></label>
        <input v-model="affiliations.organization" @input="revalidate" class="input" type="text">
      </div>

      <!-- organization link -->
      <div class="field">
        <label class="label is-uppercase" :class="{ error: hasError('organizationLink') }">Link to organization:</label>
        <input v-model="affiliations.organizationLink" @input="revalidate" class="input" type="text">
      </div>

      <h2 class="mt-50">This information will not be made public:</h2>

      <!-- identities -->
      <div class="field" divider-30>
        <label class="label">
          <span :class="{ 'has-text-danger': hasError('identity') }" style="text-transform: uppercase;">Identity<sup class="required">*</sup></span>
          <div style="font-weight: normal;">Please select all that apply</div>
        </label>

        <div class="sublabel tablet-columns-2">
          <div v-for="identity of identityOptions" :key="identity.id" class="control is-flex" style="column-break-inside: avoid;">
            <input v-model="identities[identity.id]" :id="`identity-${identity.id}`" type="checkbox" :false-value="null" class="checkbox mb-3 mt-1" @change="revalidate">
            <label class="label pl-2 pb-1" :for="`identity-${identity.id}`" style="cursor: pointer;">{{ identity.tag }}</label>
          </div>
          <div>
            <input v-model="identities.other" id="identity-other" type="checkbox" :false-value="null" class="checkbox mr-2 mb-3" @change="revalidate">
            <label for="identity-other" class="label is-inline">Other</label>
            <div>
              <input v-model="otherIdentity" @input="revalidate" class="input" style="max-width: 200px;" type="text">
            </div>
          </div>
        </div>
      </div>

      <!-- save button -->
      <div class="field my-4">
        <input type="submit" :disabled="errors.length > 0" class="button is-primary is-rounded is-fullwidth is-uppercase" :class="{'is-loading':loading}" value="Save">
      </div>

      <!-- errors -->
      <div v-if="errors.length" class="field">
        <p v-for="(error, i) of errors" :key="i" class="error has-text-centered is-uppercase">{{ error.message }}</p>
      </div>

    </form>
  </div>
</template>

<style scoped lang="scss">

.required {
  position: absolute;
}

.field:not(:last-child) {
  margin-bottom: 30px;
}

</style>
