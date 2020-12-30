<script>
import Content from '@/components/Content'

export default {
  name: 'Support',
  components: {
    Content,
  },
}

</script>

<template>

  <div class="columns m-20">
    <div class="column p-0 is-half-desktop is-offset-one-quarter-desktop">
      <Content name="support/title" format="inline" class="title page-title">Support</Content>
      <Content name="support/body" placeholder="Enter page content here" />
    </div>
  </div>

</template>
