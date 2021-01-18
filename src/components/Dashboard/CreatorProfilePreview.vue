<script>
import Square from '@/components/Square'

export default {
  components: {
    Square,
  },
  computed: {
    peopleSubmissionId() {
      const peopleSubmissions = this.$store.state.submissions.people.data || {}
      return Object.keys(this.userSubmissions)
        .find(sid => peopleSubmissions[sid]?.type === 'people')
    },
    person() {
      const peopleSubmissions = this.$store.state.submissions.people.data || {}
      const peopleId = peopleSubmissions[this.peopleSubmissionId]?.peopleId
      const person = this.$store.state.creators.data[peopleId]
      return person
    },
    userPersonSubmission() {
      return this.userSubmissions[this.peopleSubmissionId]
    },
    userSubmissions() {
      return this.$store.state.user.user.profile.submissions || {}
    },
  }
}

</script>

<template>

  <!-- pending profile -->
  <div v-if="userPersonSubmission === 'pending'">
    <p style="font-size: 30px;">Thank you! A Thousand Worlds will review your profile and reach out if we have questions or once it's been approved.</p>
  </div>

  <!-- accepted profile -->
  <div v-else-if="person">
    <h2 class="mb-20">Your Public Profile</h2>
    <div class="columns">
      <div class="column is-one-third">
        <router-link :to="{ name: 'PeopleSubmissionForm' }">
          <Square>
            <h3>Edit</h3>
          </Square>
        </router-link>
      </div>
      <div class="column is-one-third">
        <router-link :to="{ name: 'PersonDetail', params: { id: person.id } }">
          <Square style="border-radius: 999px;">
            <h3>View</h3>
          </Square>
        </router-link>
      </div>
    </div>
  </div>

  <!-- new profile -->
  <div v-else>
    <h2>Please fill our your profile for the People Directory</h2>
    <div class="field is-grouped">
      <div class="control my-20">
        <router-link class="button is-primary" :to="{name:'PeopleSubmissionForm'}">Create Profile</router-link>
      </div>
    </div>
  </div>

</template>
