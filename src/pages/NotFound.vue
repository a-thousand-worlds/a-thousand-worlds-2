<script>

export default {
  name: 'NotFound'
}

</script>

<template>

  <div>
    <h1>404 Page not Found</h1>
    <p>Looks like page you are looking for is not exists</p>
    <p>Back to <router-link :to="{name: 'Home'}">Home</router-link></p>
  </div>

</template>

<style>

</style>
