<script>
import RecommendedBy from '@/components/RecommendedBy'

export default {
  components: {
    RecommendedBy,
  },
}

</script>

<template>

  <div>

    <h2>Your Public Profile</h2>
    <RecommendedBy :modelValue="$store.state.user.user.uid" nolabel class="mb-20" />
    <router-link :to="{ name: 'ContributorProfile' }"><button class="button is-rounded is-primary">Edit Profile</button></router-link>

  </div>

</template>
