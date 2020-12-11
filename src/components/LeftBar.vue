<script>
import MainMenu from '@/components/MainMenu.vue'

export default {
  components: {
    MainMenu,
  },
}
</script>

<template>
  <aside class="is-align-self-stretch menu is-flex-direction-column is-justify-content-space-between">

    <div class="mb-10">
      <router-link :to="{name: 'Home'}"><span class="wrapper"><img title="COLORFUL READS X COLORFUL PEOPLE: Picture books curated by leaders in the industry" src="@/assets/logo.png" style="max-width: 100px; max-height: 100px;"></span></router-link>
    </div>

    <MainMenu />

  </aside>
</template>

<style scoped lang="scss">
@import '@/assets/vars.scss';

</style>
