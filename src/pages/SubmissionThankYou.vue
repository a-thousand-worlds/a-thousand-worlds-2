<script>
import Content from '@/components/Content'

export default {
  name: 'SubmissionThankYou',
  components: {
    Content,
  },
  computed: {
    type() {
      return this.$route.params.type
    },
  },
}
</script>

<template>
  <div class="my-50 is-flex is-justify-content-center">
    <div class="is-flex-grow-1 mx-20" style="max-width: 760px">
      <h1 class="title has-text-centered">Thank you</h1>
      <div class="has-text-centered my-30">
        <p class="mb-20" style="font-size: 30px">
          <Content name="submission/thankyou"
            >Thank you! A Thousand Worlds will review your
            {{ type === 'people' ? 'profile' : 'submission' }} and reach out if we have questions or
            once it's been approved.</Content
          >
        </p>
        <router-link :to="{ name: 'Dashboard' }"
          ><button class="button is-rounded is-primary">Dashboard</button></router-link
        >
      </div>
    </div>
  </div>
</template>
