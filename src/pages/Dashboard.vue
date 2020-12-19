<script>
import DashboardReviewSubmissionsPreview from '@/components/DashboardReviewSubmissionsPreview'
import InviteWidget from '@/components/InviteWidget'
import SubmissionWidget from '@/components/SubmissionWidget'

export default {
  components: {
    DashboardReviewSubmissionsPreview,
    InviteWidget,
    SubmissionWidget,
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
      return this.$store.state.bookSubmissions?.data || {}
    },
    bundleSubmissions() {
      return this.$store.state.bundleSubmissions?.data || {}
    },
    peopleSubmissions() {
      return this.$store.state.peopleSubmissions?.data || {}
    },
    submissionsList() {
      if (!this.$store.state.user.user?.profile.submissions) {
        return []
      }
      return Object.keys(this.$store.state.user.user.profile.submissions)
    },
    hasSubmissions() {
      return !!this.submissionsList.length
    },
    canSuggest() {
      return this.$iam('contributor') || this.$iam('admin') || this.$iam('superadmin')
    },
    canApprove() {
      return this.$iam('admin') || this.$iam('superadmin')
    },
    canInvite() {
      return this.$iam('admin') || this.$iam('superadmin')
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

      <div class="header-options mr-10">
        <router-link :to="{ name: 'Profile' }" style="color: black;">Edit your profile</router-link>
      </div>

      <section v-if="canSuggest" class="section bordered-top">
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

      <section v-if="canInvite" class="section bordered-top">
        <h2>Invite Users</h2>
        <invite-widget ref="invite" format="compact" />
        <ul class="my-20">
          <li><router-link :to="{ name: 'Invite' }">Edit email templates</router-link></li>
          <li><router-link :to="{ name: 'InvitationManager' }">View invitations</router-link></li>
        </ul>
      </section>

      <section class="section" v-if="canSuggest && hasSubmissions">
        <h2>Your Submissions</h2>
        <div class="columns is-multiline">
          <div class="column is-6-tablet is-4-desktop is-3-widescreen" v-for="sid of submissionsList" :key="sid">
            <submission-widget class="submission-widget" :sid="sid" :state="$store.state.user.user.profile.submissions[sid]"/>
          </div>
        </div>
      </section>

      <section v-if="canApprove" class="section">
        <h2>Review Submissions</h2>
        <DashboardReviewSubmissionsPreview :bookSubmissions="bookSubmissions" :peopleSubmissions="peopleSubmissions" :bundleSubmissions="bundleSubmissions" />
      </section>

    </div>
  </div>

</template>

<style lang="scss" scoped>
@import '@/assets/main.scss';

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
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid $atw-base;
}

a.button {
  min-width: 200px;
  border-radius: 20px;
}

</style>
