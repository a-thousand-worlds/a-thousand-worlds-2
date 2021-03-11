<script>
import ContributorProfileForm from '@/components/Dashboard/ContributorProfileForm'

export default {
  components: {
    ContributorProfileForm,
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

        <h1 class="page-title divider-bottom">Edit Profile</h1>

        <ContributorProfileForm />
      </div>

    </div>

  </div>

</template>
