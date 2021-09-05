<script>
import Content from '@/components/Content'
import PublicProfileForm from '@/components/Dashboard/PublicProfileForm'

export default {
  components: {
    Content,
    PublicProfileForm,
  },
}
</script>

<template>
  <div class="mx-20 mb-30">
    <div class="is-flex is-justify-content-center">
      <div>
        <div class="mb-5">
          <a @click.prevent="$router.back" class="is-uppercase is-primary">&lt; Back</a>
        </div>

        <h1 class="page-title divider-bottom">
          <Content name="contributor-profile/title" format="label">Edit Profile</Content>
        </h1>

        <PublicProfileForm />
      </div>
    </div>
  </div>
</template>
