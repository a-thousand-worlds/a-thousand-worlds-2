<script>
import Content from '@/components/Content'

export default {
  name: 'About',
  components: {
    Content,
  },
}

</script>

<template>

  <div class="columns m-20">
    <div class="column p-0 is-half-desktop is-offset-one-quarter-desktop">
      <h1 class="title page-title">About</h1>
      <Content name="about" placeholder="Enter page content here" />
    </div>
  </div>

</template>
