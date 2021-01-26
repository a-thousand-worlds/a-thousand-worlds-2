<script>
import Content from '@/components/Content'
import LogoStacked from '../assets/logo-stacked.svg'

export default {
  components: {
    Content,
    LogoStacked,
  },
}
</script>

<template>
  <div class="welcome-banner" ref="welcome">
    <div class="columns px-20 my-50" style="max-width: 1400px; margin: auto;">

      <div class="column left align-items-center">
        <Content name="welcome/left" placeholder="Colorful Reads x Colorful People" />
      </div>

      <div class="column">
        <LogoStacked class="logo" title="A Thousand Worlds" />
      </div>

      <div class="column">
        <div class="subtitle is-flex is-align-items-center" style="height: 100%; max-width: 320px; margin: auto;">
          <Content name="welcome/right" placeholder="Picture books curated by BIPOC leaders in the industry" style="text-align: center;" />
        </div>
      </div>

    </div>
  </div>
</template>

<!-- do not scope so that we can style CKEditor -->
<style lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/style/mixins.scss';
@import '@/assets/style/vars.scss';

.welcome-banner {
  @include primary(background-color);
  width: 100%;
  top: 0;
  text-align: center;
  color: white;
  font-size: 20px;

  @include from($widescreen) { font-size: 26px; }

  .ck p {
    text-align: center;
    line-height: 1.5;
  }

  .subtitle {
    line-height: 31px;
  }

  .logo {
    fill: white !important;
    width: 100%;
    max-height: 150px;
  }
}

</style>
