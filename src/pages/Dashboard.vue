<script>

import InviteWidget from '@/components/InviteWidget'
import SubmissionWidget from '@/components/SubmissionWidget'
import SubmissionsReviewList from '@/components/SubmissionsReviewList'

export default {
  components: {
    InviteWidget,
    SubmissionWidget,
    SubmissionsReviewList
  },
  data() {
    return {
      templates: {
        showEmailTemplates: false,
      },
    }
  },
  computed: {
    username() {
      return this.$store.state.user?.profile.name || this.$store.state.user?.profile.email
    },
    submissionsList() {
      if (!this.$store.state.user.profile.submissions) {
        return []
      }
      return Object.keys(this.$store.state.user.profile.submissions)
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
  },
}

</script>

<template>

<div class="page" style="position: relative" @click.prevent="$refs.invite?.setInviteDropdown(false)">

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
    <div class="my-20">
      <router-link :to="{ name: 'Invite' }">Edit email templates</router-link>
    </div>
  </section>

  <section class="section" v-if="canSuggest && hasSubmissions">
    <h2>Your Submissions</h2>
    <div class="columns is-multiline">
      <div class="column is-6-tablet is-4-desktop is-3-widescreen" v-for="sid of submissionsList" :key="sid">
        <submission-widget class="submission-widget" :sid="sid" :state="$store.state.user.profile.submissions[sid]"/>
      </div>
    </div>
  </section>

  <submissions-review-list v-if="canApprove"/>

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

.submission-widget {
  border: 1px solid $atw-base;
  // margin-bottom: 0.75rem;
  // margin-left: 0.75rem;
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
