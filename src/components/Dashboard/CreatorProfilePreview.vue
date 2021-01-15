<script>

export default {
  computed: {
    peopleSubmission() {
      const peopleSubmissions = this.$store.state.submissions.people.data
      return Object.keys(this.userSubmissions)
        .find(sid => peopleSubmissions[sid]?.type === 'people')
    },
    person() {
      return this.personSubmission === 'approved' ? 'TODO' : null
    },
    personSubmission() {
      return this.userSubmissions[this.peopleSubmission]
    },
    userSubmissions() {
      return this.$store.state.user.user.profile.submissions || {}
    },
  }
}

</script>

<template>
  <div v-if="personSubmission === 'pending'">
    <p style="font-size: 30px;">Thank you! A Thousand Worlds will review your profile and reach out if we have questions or once it's been approved.</p>
  </div>
  <div v-else-if="person">
    TODO: Edit|View Creattor Profile
  </div>
  <div v-else>
    <h2>Please fill our your profile for the People Directory</h2>
    <div class="field is-grouped">
      <div class="control my-20">
        <router-link class="button is-primary" :to="{name:'PeopleSubmissionForm'}">Create Profile</router-link>
      </div>
    </div>
  </div>
</template>
