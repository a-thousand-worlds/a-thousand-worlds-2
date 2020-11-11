<script>

export default {
  name: 'ProfilePage'
}

</script>

<template>

  <div>
    <h1 class="title">Profile</h1>
    <div class="container">
      <div v-if="!!$store.state.user" class="level">
        <div class="level-item">
          <img :src="$store.state.user.photoUrl"/>
        </div>
        <div class="level-item">
          <h2 class="subtitle">{{$store.state.user.profile.firstName}}</h2>
          <h2 class="subtitle">{{$store.state.user.profile.lastName}}</h2>
        </div>
      </div>
    </div>

  </div>
</template>

<style>

</style>
