<script>

import SubmissionWidget from '@/components/SubmissionWidget'
import SubmissionsReviewList from '@/components/SubmissionsReviewList'

export default {
  components: {
    SubmissionWidget,
    SubmissionsReviewList
  },
  computed: {
    username() {
      return this.$store.state.user?.profile.name || this.$store.state.user?.profile.email
    },
    hasSubmissions() {
      if (Array.isArray(this.$store.state.user.profile.submissions) && this.$store.state.user.profile.submissions.length) {
        return true
      }
      return false
    },
    canSuggest() {
      return this.$iam('contributor') || this.$iam('admin') || this.$iam('superadmin')
    },
    canApprove() {
      return this.$iam('admin') || this.$iam('superadmin')
    }
  }
}

</script>

<template>

<div class="page">
  <h1 class="title page-title">Your Dashboard</h1>
  <router-link :to="{ name: 'Profile' }">Edit your profile</router-link>

  <section v-if="canSuggest" class="section bordered-top">
    <h2 class="title">Suggest a book or bundle for A Thousand Worlds</h2>
    <div class="field is-grouped">
      <div class="control">
        <router-link class="button is-outlined is-primary" :to="{name:'BookSuggest'}">Book</router-link>
      </div>
      <div class="control">
        <router-link class="button is-outlined is-primary" :to="{name:'BundleSuggest'}">Bundle</router-link>
      </div>
    </div>
  </section>

  <section class="section" v-if="canSuggest && hasSubmissions">
    <h2 class="title">Your Submissions</h2>
    <div class="columns is-multiline">
      <div class="column is-6-tablet is-4-desktop is-3-widescreen" v-for="sid of $store.state.user.profile.submissions" :key="sid">
        <submission-widget class="submission-widget" :sid="sid"></submission-widget>
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
