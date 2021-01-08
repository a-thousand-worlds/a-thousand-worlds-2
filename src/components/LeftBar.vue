<script>
import MainMenu from '@/components/MainMenu.vue'
import Logo from '../assets/logo.svg'

export default {
  components: {
    Logo,
    MainMenu,
  },
}
</script>

<template>
  <aside class="is-align-self-stretch menu is-flex-direction-column is-justify-content-space-between">

    <div class="mb-10">
      <router-link :to="{name: 'Home'}"><span class="wrapper"><Logo title="COLORFUL READS X COLORFUL PEOPLE: Picture books curated by leaders in the industry" style="max-width: 100px; max-height: 100px;" /></span></router-link>
    </div>

    <MainMenu />

  </aside>
</template>
