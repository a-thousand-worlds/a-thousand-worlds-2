<template>
  <div>
    <h2>Your Public Profile</h2>
    <!-- <RecommendedBy :modelValue="$store.state.user.user.uid" nolabel class="mb-20" /> -->
    <router-link :to="{ name: 'PublicProfile' }"
      ><button class="button is-rounded is-primary">Edit Profile</button></router-link
    >
  </div>
</template>
