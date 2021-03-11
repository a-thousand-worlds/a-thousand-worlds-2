<script>
import RecommendedBy from '@/components/RecommendedBy'
import Square from '@/components/Square'

export default {
  components: {
    RecommendedBy,
    Square,
  },
  computed: {
  }
}

</script>

<template>

  <div>

    {{ $store.state.user.user.uid }}
    <h2 class="mb-20">Your Public Profile</h2>
    <div class="columns">

      <div class="column is-one-third">
        <Square>
          <RecommendedBy :modelValue="$store.state.user.user.uid" />
        </Square>
      </div>

      <div class="column is-one-third">
        <router-link :to="{ name: 'PersonSubmissionForm' }">
          <Square style="border-radius: 999px;">
            <h3>Edit</h3>
          </Square>
        </router-link>
      </div>

    </div>

  </div>

</template>
