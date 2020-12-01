<script>

import SubmissionWidget from '@/components/SubmissionWidget'

export default {
  name: 'ProfilePage',
  created() {
    console.log(this.$store.state.user)
  },
  computed: {
    username() {
      if (!this.$store.state.user) {
        return ''
      }
      if (this.$store.state.user.profile.firstName.length) {
        return this.$store.state.user.profile.firstName + ' ' + this.$store.state.user.profile.lastName
      }
      return this.$store.state.user.profile.email
    },
    hasSubmissions() {
      if (Array.isArray(this.$store.state.user.profile.submissions) && this.$store.state.user.profile.submissions.length) {
        return true
      }
      return false
    }
  },
  components: {
    'submission-widget': SubmissionWidget
  }
}

</script>

<template>

<h1 class="title page-title">Your Dashboard</h1>
<hr>
<section class="section">
  <h1 class="title">Suggest a book or bundle for A Thousand Worlds</h1>
  <div class="field is-grouped">
    <div class="control">
      <router-link class="button is-outlined is-primary" :to="{name:'BookSuggest'}">Book</router-link>
    </div>
    <div class="control">
      <router-link class="button is-outlined is-primary" :to="{name:'Home'}">Bundle</router-link>
    </div>
  </div>
</section>

<section class="section" v-if="hasSubmissions">
  <h1 class="title">Your Submissions</h1>
  <div class="columns">
    <div v-for="sid of $store.state.user.profile.submissions" :key="sid">
      <submission-widget class="column" :sid="sid"></submission-widget>
    </div>
  </div>
</section>

</template>

<style>

</style>
