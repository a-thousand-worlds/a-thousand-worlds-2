<script>

export default {
  name: 'SubmissionThankYou',
}

</script>

<template>

  <div class="my-50 is-flex is-justify-content-center">
    <div class="is-flex-grow-1 mx-20" style="max-width: 760px;">

      <h1>Thank you for your submission!</h1>
      <div class="has-text-centered my-20">
        <router-link :to="{ name: 'Dashboard' }"><button class="button is-rounded is-primary">Dashboard</button></router-link>
      </div>

    </div>
  </div>

</template>
