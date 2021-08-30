<script>
import validator from '@/mixins/validator'
import PhotoUpload from '@/components/PhotoUpload'
import engagementOptions from '@/store/constants/engagements'

const newAffiliations = () => ({
  organization: '',
  organizationLink: '',
  otherEngagementCategory: '',
  website: null,
  selectedEngagementCategories: {},
})

export default {
  components: {
    PhotoUpload,
  },
  mixins: [
    validator(function () {
      const hasIdentity = Object.values(this.identities).some(x => x)
      const hasSelectedEngagements = Object.values(
        this.affiliations.selectedEngagementCategories,
      ).some(x => x)
      const errors = [
        // admin only
        ...(this.admin && !this.name
          ? [
              {
                name: 'name',
                message: 'Name is required',
              },
            ]
          : []),

        ...(!hasSelectedEngagements && !this.affiliations.otherEngagementCategory
          ? [
              {
                name: 'engagements',
                message: 'How you engage with books is required',
              },
            ]
          : []),

        // not required for admin
        ...(!this.admin
          ? [
              !this.affiliations.website
                ? [
                    {
                      name: 'website',
                      message: 'Your website is required',
                    },
                  ]
                : [],
              ...(this.welcome && !hasIdentity && !this.otherIdentity
                ? [
                    {
                      name: 'identity',
                      message: 'Identity is required',
                    },
                  ]
                : []),
            ]
          : []),
      ].flat()

      return errors
    }),
  ],
  props: {
    admin: Boolean,
    contributor: {},
    welcome: Boolean,
  },
  emits: ['cancel', 'save'],
  data() {
    const profile = this.contributor || this.$store.state.user.user?.profile
    return {
      affiliations: {
        ...newAffiliations(),
        ...profile?.affiliations,
      },
      disableAfterSave: false,
      engagementOptions,
      identities: profile?.identities ? { ...profile.identities } : {},
      loading: false,
      name: profile?.name || '', // admin only
      otherIdentity: null,
      photo: profile.photo || null,
    }
  },
  computed: {
    // top-level tags used as identities that are allowed to be shown on the contributor form
    tags() {
      const tags = this.$store.getters[`tags/people/listSorted`]()
      return tags.filter(
        tag1 =>
          tag1.showOnContributorForm && !tag1.parent && !tags.some(tag2 => tag2.parent === tag1.id),
      )
    },

    // gender subtags that are allowed to be shown on the contributor form
    tagsGender() {
      const tagGender = this.$store.getters[`tags/people/findBy`]('tag', 'Gender')
      return tagGender
        ? this.$store.getters[`tags/people/listSorted`]().filter(
            tag => tag.showOnContributorForm && tag.parent === tagGender.id,
          )
        : []
    },
  },
  watch: {
    '$store.state.user.user'(next, prev) {
      this.identities = next?.profile?.identities || this.identities
      this.photo = next?.profile?.photo || this.photo || null
    },
  },
  methods: {
    async saveProfile() {
      if (!this.validate()) return

      clearTimeout(this.messageTimeout)
      clearTimeout(this.disableAfterSaveTimeout)
      this.disableAfterSave = true

      this.loading = true

      const profile = {
        affiliations: this.affiliations,
        identities: this.identities,
        name: this.name,
        otherIdentity: this.otherIdentity,
        photo: this.photo || null,
        ...(this.admin ? { name: this.name } : null),
      }

      const savePromise = this.contributor
        ? // admin edit contributor
          this.$store.dispatch('users/update', {
            path: `${this.contributor.id}/profile`,
            value: profile,
          })
        : // new contributor or existing contributor self
          this.$store.dispatch(this.admin ? 'users/saveContributor' : 'user/updateProfile', profile)

      // do not await so we can emit save with a promise
      savePromise
        .then(uid => {
          this.loading = false
          this.disableAfterSave = false
          this.$store.dispatch('ui/popup', {
            text: `${this.admin ? 'Contributor' : 'Profile'} saved`,
            type: 'success',
          })
          return uid
        })
        .catch(e => {
          this.loading = false
          this.disableAfterSave = false
          throw new Error(e)
        })

      this.$emit(
        'save',
        savePromise.then(uid => ({
          ...profile,
          id: uid,
        })),
      )
    },

    // admin only
    cancel() {
      this.affiliations = newAffiliations()
      this.identities = {}
      this.otherIdentity = null
      this.name = ''
      this.$emit('cancel')
    },
  },
}
</script>

<template>
  <div class="is-flex is-justify-content-center">
    <div style="max-width: 540px">
      <h2 v-if="welcome" class="field">
        Welcome! Let's start by getting the information that will be displayed with your book
        recommendations.
      </h2>

      <form class="is-flex-grow-1" @submit.prevent="saveProfile">
        <div class="is-flex field">
          <!-- photo -->
          <PhotoUpload
            v-model="photo"
            :noMinimumSize="admin"
            class="mr-30 my-40"
            style="width: 45%"
          />

          <div class="is-flex-grow-1 is-flex is-justify-content-center is-flex-direction-column">
            <!-- name (admin only) -->
            <div v-if="admin" class="field">
              <label class="label is-uppercase" :class="{ error: hasError('name') }"
                >Name<sup class="required">*</sup></label
              >
              <input v-model="name" class="input" type="text" />
            </div>

            <!-- website -->
            <!-- add a little extra margin on the right so that "social media url" doesn't wrap -->
            <div class="field">
              <label
                class="label is-uppercase"
                :class="{ error: hasError('website') }"
                style="margin-right: -5px"
                >Your website or social media URL<sup v-if="!admin" class="required">*</sup></label
              >
              <input v-model="affiliations.website" class="input" type="text" />
            </div>

            <!-- engagement -->
            <div class="field">
              <label class="label is-uppercase" :class="{ error: hasError('engagements') }"
                >How do you engage with books?<sup class="required">*</sup></label
              >
              <div class="sublabel tablet-columns-2">
                <div
                  v-for="engagement of engagementOptions"
                  :key="engagement.id"
                  class="control columns-2"
                >
                  <input
                    :id="`engagement-${engagement.id}`"
                    v-model="affiliations.selectedEngagementCategories[engagement.id]"
                    :name="engagement.id"
                    @change="revalidate"
                    type="checkbox"
                    :false-value="null"
                    class="checkbox mr-2 mb-3"
                  />
                  <label
                    class="label is-inline"
                    style="word-wrap: nobreak"
                    :for="`engagement-${engagement.id}`"
                  >
                    {{ engagement.text }}
                  </label>
                </div>
                <div>
                  <input
                    v-model="affiliations.selectedEngagementCategories.other"
                    id="engagement-other"
                    type="checkbox"
                    class="checkbox mr-2 mb-3"
                    @change="revalitate"
                  />
                  <label for="engagement-other" class="label is-inline">Other</label>
                  <div>
                    <input
                      v-model="affiliations.otherEngagementCategory"
                      @change="revalidate"
                      class="input"
                      style="max-width: 200px"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- organization -->
        <div class="field">
          <label class="label is-uppercase" :class="{ error: hasError('organizationName') }"
            >Are you affiliated with an organization?</label
          >
          <input
            v-model="affiliations.organization"
            @input="revalidate"
            class="input"
            type="text"
          />
        </div>

        <!-- organization link -->
        <div class="field">
          <label class="label is-uppercase" :class="{ error: hasError('organizationLink') }"
            >Link to organization</label
          >
          <input
            v-model="affiliations.organizationLink"
            @input="revalidate"
            class="input"
            type="text"
          />
        </div>

        <div v-if="admin || welcome || true">
          <h2 v-if="!admin" class="mt-50 mb-30">
            ATW is based on raising the voices of diverse identities. We'd love to know how you
            identify. This information will not be made public.
          </h2>

          <!-- identities -->
          <div v-if="!admin" class="field" divider-30>
            <label class="label">
              <span
                :class="{ 'has-text-danger': hasError('identity') }"
                style="text-transform: uppercase"
                >Identity<sup v-if="!admin" class="required">*</sup></span
              >
              <div style="font-weight: normal">Please select all that apply</div>
            </label>

            <div class="sublabel tablet-columns-2">
              <div
                v-for="tag of tags"
                :key="tag.id"
                class="control is-flex"
                style="column-break-inside: avoid"
              >
                <input
                  v-model="identities[tag.id]"
                  :id="`tag-${tag.id}`"
                  type="checkbox"
                  :false-value="null"
                  class="checkbox mb-3 mt-1"
                  @change="revalidate"
                />
                <label class="label pl-2 pb-1" :for="`tag-${tag.id}`" style="cursor: pointer">{{
                  tag.tag
                }}</label>
              </div>
              <div>
                <input
                  v-model="identities.other"
                  id="tag-other"
                  type="checkbox"
                  :false-value="null"
                  class="checkbox mr-2 mb-3"
                  @change="revalidate"
                />
                <label for="tag-other" class="label is-inline">Other</label>
                <div>
                  <input
                    v-model="otherIdentity"
                    @input="revalidate"
                    class="input"
                    style="max-width: 200px"
                    type="text"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- genders -->
          <!-- (stored in identities) -->
          <div v-if="!admin && tagsGender.length > 0" class="field" divider-30>
            <label class="label">
              <span
                :class="{ 'has-text-danger': hasError('gender') }"
                style="text-transform: uppercase"
                >Gender<sup v-if="!admin" class="required">*</sup></span
              >
              <div style="font-weight: normal">Please select all that apply</div>
            </label>

            <div class="sublabel tablet-columns-2">
              <div
                v-for="tag of tagsGender"
                :key="tag.id"
                class="control is-flex"
                style="column-break-inside: avoid"
              >
                <input
                  v-model="identities[tag.id]"
                  :id="`tag-${tag.id}`"
                  type="checkbox"
                  :false-value="null"
                  class="checkbox mb-3 mt-1"
                  @change="revalidate"
                />
                <label class="label pl-2 pb-1" :for="`tag-${tag.id}`" style="cursor: pointer">{{
                  tag.tag
                }}</label>
              </div>
            </div>
          </div>
        </div>

        <!-- save button -->
        <div class="field my-4">
          <input
            type="submit"
            :disabled="!loading && errors.length > 0"
            class="button is-primary is-rounded is-fullwidth is-uppercase"
            :class="{ 'is-loading': loading }"
            value="Save"
          />
        </div>

        <!-- cancel button (admin only) -->
        <div v-if="admin" class="field my-4">
          <input
            type="button"
            value="Cancel"
            @click.prevent="cancel"
            class="button is-rounded is-fullwidth is-uppercase"
          />
        </div>

        <!-- errors -->
        <div v-if="errors.length" class="field">
          <p v-for="(error, i) of errors" :key="i" class="error has-text-centered is-uppercase">
            {{ error.message || 'Unknown error' }}
          </p>
        </div>
      </form>
    </div>
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
