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

    <div id="logo">
      <router-link :to="{name: 'Home'}"><span class="wrapper"><!-- <img title="COLORFUL READS X COLORFUL PEOPLE: Picture books curated by leaders in the industry" src="@/assets/logo.png"> --></span></router-link>
    </div>

    <MainMenu />

  </aside>
</template>

<style scoped lang="scss">
@import '@/assets/vars.scss';

.inline {
  display: inline;
}

#logo {
  width: 80px;
  height: 80px;
  background: $grey;
  border-radius: 50%;
  margin-bottom: 20px;
}

</style>
