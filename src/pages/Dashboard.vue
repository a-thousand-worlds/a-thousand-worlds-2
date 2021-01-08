<script>
import DashboardReviewSubmissionsPreview from '@/components/DashboardReviewSubmissionsPreview'
import DashboardYourSubmissions from '@/components/DashboardYourSubmissions'
import InviteWidget from '@/components/InviteWidget'

export default {
  components: {
    DashboardReviewSubmissionsPreview,
    DashboardYourSubmissions,
    InviteWidget,
  },
  data() {
    return {
      templates: {
        showEmailTemplates: false,
      },
    }
  },
  computed: {
    submissionsList() {
      return Object.keys(this.$store.state.user.user.profile.submissions || {})
    },
    hasSubmissions() {
      return !!this.submissionsList.length
    },
    username() {
      return this.$store.state.user.user?.profile.name || this.$store.state.user.user?.profile.email
    },
  },
}

</script>

<template>

  <div class="is-flex is-justify-content-center" @click.prevent="$refs.invite?.setInviteDropdown(false)">
    <div class="is-flex-grow-1 mx-20" style="max-width: 1080px; position: relative">

      <h1 class="title page-title">Your Dashboard</h1>

      <div v-if="!$iam('creator')" class="header-options mr-10">
        <router-link :to="{ name: 'Profile' }" style="color: black;">Edit your profile</router-link>
      </div>

      <section v-if="$iam('creator')" class="section bordered-top">
        <h2>Please fill our your profile for the People Directory</h2>
        <div class="field is-grouped">
          <div class="control my-20">
            <router-link class="button is-primary" :to="{name:'PeopleSubmissionForm'}">Create Profile</router-link>
          </div>
        </div>
      </section>

      <section v-if="$can('submit')" class="section bordered-top">
        <h2>Suggest a book or bundle for A Thousand Worlds</h2>
        <div class="field is-grouped">
          <div class="control">
            <router-link class="button is-outlined is-primary" :to="{name:'BookSuggest'}">Book</router-link>
          </div>
          <div class="control">
            <router-link class="button is-outlined is-primary" :to="{name:'BundleSuggest'}">Bundle</router-link>
          </div>
        </div>
      </section>

      <section v-if="$can('invite')" class="section bordered-top">
        <h2>Invite Users</h2>
        <InviteWidget ref="invite" />
        <ul class="my-20">
          <li v-if="$can('editEmailTemplates')"><router-link :to="{ name: 'EmailTemplates' }">Edit email templates</router-link></li>
          <li v-if="$can('manageInvites')"><router-link :to="{ name: 'InvitationManager' }">View invitations</router-link></li>
        </ul>
      </section>

      <section v-if="$can('submit') && hasSubmissions" class="section my-30 py-0">
        <DashboardYourSubmissions />
      </section>

      <section v-if="$can('review')" class="section my-30 py-0">
        <h2>Review Submissions</h2>
        <DashboardReviewSubmissionsPreview />
      </section>

    </div>
  </div>

</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/mixins.sass";
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
