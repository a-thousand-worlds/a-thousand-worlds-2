<script>
import ContributorProfileForm from '@/components/Dashboard/ContributorProfileForm'
import ContributorProfilePreview from '@/components/Dashboard/ContributorProfilePreview'
import CreatorProfilePreview from '@/components/Dashboard/CreatorProfilePreview'
import InviteWidget from '@/components/InviteWidget'
import Loader from '@/components/Loader'
import ManageCollectionsPreview from '@/components/Dashboard/ManageCollectionsPreview'
import ReviewSubmissionsPreview from '@/components/Dashboard/ReviewSubmissionsPreview'
import YourBookSubmissions from '@/components/Dashboard/YourBookSubmissions'

export default {
  components: {
    ContributorProfileForm,
    ContributorProfilePreview,
    CreatorProfilePreview,
    Loader,
    InviteWidget,
    ManageCollectionsPreview,
    ReviewSubmissionsPreview,
    YourBookSubmissions,
  },
  data() {
    return {
      templates: {
        showEmailTemplates: false,
      },
    }
  },
  computed: {
    bookSubmissions() {
      return this.$store.getters['submissions/books/list']()
    },
    loaded() {
      return this.$store.state.user.user
    },
    username() {
      return this.$store.state.user.user?.profile.name || this.$store.state.user.user?.profile.email
    },
    hasPendingContributorProfile() {
      // if affiliations are set, we know the user completed the ContributorProfileForm
      // returns true for non-contributors

      const affiliations = this.$store.state.user.user?.profile.affiliations
      return this.$iam('contributor') && (
        !affiliations ||
        (!affiliations.website && !affiliations.organization && !affiliations.organizationLink && !(Object.values(affiliations.selectedEngagementCategory).length > 0 || affiliations.otherEngagementCategory)
        )
      )
    },
  },
  created() {
    // cuz submissions collection is readable only per element for non owners
    // we need to preload them
    const submissions = this.$store.state.user.user.profile.submissions || {}
    const preloads = Object.keys(submissions).map(submissionId => {
      return this.$store.dispatch('submissions/books/loadOne', submissionId)
    })
    Promise.all(preloads)
  },
}

</script>

<template>

  <div class="is-flex is-justify-content-center">
    <div class="is-flex-grow-1 mx-20" style="max-width: 1080px; position: relative">

      <h1 class="title page-title">Your Dashboard</h1>

      <div v-if="!hasPendingContributorProfile" class="header-options mr-10">
        <router-link :to="{ name: 'Account' }" style="color: black;">Your Account</router-link>
      </div>

      <div v-if="!loaded" class="has-text-centered" style="margin-top: 20vh;">
        <Loader />
      </div>

      <section v-if="$iam('creator')" class="section bordered-top">
        <CreatorProfilePreview />
      </section>

      <section v-if="$can('submitBookOrBundle')" class="section bordered-top">

        <div v-if="$iam('contributor')">
          <ContributorProfileForm v-if="hasPendingContributorProfile" welcome />
          <ContributorProfilePreview v-else class="mb-30" />
        </div>

        <div v-if="!hasPendingContributorProfile">

          <h2 v-if="$can('submitPerson')">Submission Forms</h2>
          <h2 v-else>Suggest a book</h2>

          <div class="bg-secondary p-20 mb-20" style="display: inline-block; border-radius: 10px; font-size: 20px;">
            <h2 class="field">Getting Started</h2>
            <p class="field">To submit picture books click on <b>BOOKS</b>. The BOOK Submission Form will allow you to submit multiple picture books to be reviewed by the ATW curatorial team and entered into the BOOK directory upon approval.</p>
            <p class="field">To submit a book bundle click on <b>BUNDLE</b>. The BUNDLE Submission Form will allow you to submit a collection of 4-7 books based on one theme.  The BOOK BUNDLE is an opportunity to spotlight a certain theme, support a BIPOC bookstore and also to showcase you. Your bio and picture will be included in the BUNDLE as well. The BUNDLE form will be reviewed by the ATW curatorial team and entered into the BOOK BUNDLE directory upon approval.</p>
            <button class="button is-rounded is-primary">Okay, got it</button>
          </div>

          <div class="field is-grouped">
            <div class="control">
              <router-link class="button is-outlined is-primary" :to="{name:'BookSubmissionForm'}">Book</router-link>
            </div>
            <div v-if="$can('submitPerson')" class="control">
              <router-link class="button is-outlined is-primary" :to="{name:'PersonSubmissionForm'}">Person</router-link>
            </div>
            <!-- <div class="control">
              <router-link class="button is-outlined is-primary" :to="{name:'BundleSubmissionForm'}">Bundle</router-link>
            </div> -->
          </div>

        </div>

      </section>

      <section v-if="$can('invite') && !hasPendingContributorProfile" class="section bordered-top">
        <h2>Invite Users</h2>
        <InviteWidget ref="invite" />
        <ul class="my-20">
          <li v-if="$can('editEmailTemplates')"><router-link :to="{ name: 'EmailTemplates' }">Edit email templates</router-link></li>
          <li v-if="$can('manageInvites')"><router-link :to="{ name: 'InvitationManager' }">View invitations</router-link></li>
        </ul>
      </section>

      <section v-if="$can('submitBookOrBundle') && bookSubmissions.length" class="section my-30 py-0">
        <YourBookSubmissions />
      </section>

      <section v-if="$can('review')" class="section my-30 py-0">
        <h2>Review Submissions</h2>
        <ReviewSubmissionsPreview />
      </section>

      <section v-if="$can('manageCollections')" class="section my-30 py-0">
        <h2>Manage Collections</h2>
        <ManageCollectionsPreview />
        <router-link :to="{ name: 'TagsManager' }">Tags Manager</router-link>
      </section>

    </div>
  </div>

</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/style/mixins.scss';

.page {
  width: 100%;
  // max-width: 720px;
  margin: auto;
  padding: 0.75rem;
}

h2.title {
  font-size: 1.5rem;
}

.header-options {
  display: flex;
  justify-content: center;

  @include from($desktop) {
    position: absolute;
    top: 35px;
    right: 0;
  }
}

.bordered-top {
  @include primary(border-top-color);
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid;
}

a.button {
  min-width: 200px;
  border-radius: 20px;
}

</style>
