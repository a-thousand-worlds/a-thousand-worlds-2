<script>

export default {
  name: 'NotFound'
}

</script>

<template>

  <div class="is-flex is-justify-content-center">
    <div class="is-flex-grow-1 mx-20" style="max-width: 760px;">
      <h1>Oops... Page Not Found</h1>
      <p class='mb-20'>Looks like the page you are looking for does not exist.</p>
      <p>Back to <router-link :to="{name: 'Home'}">Home</router-link></p>
    </div>
  </div>

</template>

<style>

</style>
