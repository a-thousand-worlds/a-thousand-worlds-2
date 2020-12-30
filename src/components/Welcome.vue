<script>

export default {
  data() {
    return {}
  },
}

</script>

<template>
  <div class="welcome">
    <div class="my-50">
      <h1 class="title is-uppercase mb-30" style="font-weight: 500;">A Thousand Worlds</h1>
      <h2 class="subtitle">COLORFUL READS x COLORFUL PEOPLE<br/>
      Picture books curated by BIPOC leaders in the industry</h2>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

.welcome {
  width: 100%;
  position: fixed;
  top: 0;
  z-index: 10;
  background: $atw-base;
  text-align: center;

  .title, .subtitle {
    color: #fff;
  }

  .subtitle {
    line-height: 31px;
  }
}

</style>
