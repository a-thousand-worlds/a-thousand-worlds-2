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
      <Content name="about/title" class="title page-title" format="inline">About</Content>
      <Content name="about/body" placeholder="Enter page content here" />
    </div>
  </div>
</template>
