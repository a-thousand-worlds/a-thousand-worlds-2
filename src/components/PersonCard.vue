<script>
import PersonDetailLink from '@/components/PersonDetailLink'

export default {
  components: {
    PersonDetailLink,
  },
  props: ['person'],
  computed: {
    bgImage() {
      return this.person.photo
    }
  },
}

</script>

<template>
  <PersonDetailLink :person="person">
    <div :style="{backgroundImage: `url(${bgImage})`}" class="photo-wrapper bg-secondary mb-20" />
    <span class="is-uppercase">{{ person.name }}</span>
  </PersonDetailLink>

</template>

<style scoped lang="scss">
@import '@/assets/style/vars.scss';
@import '@/assets/style/mixins.scss';

a {
  color: #000;
  font-size: 110%;
}

.photo-wrapper {
  @include primary(border-color);
  width: 100%;
  padding-top: 100%;
  border: 1px solid;
  border-radius: 50%;
  background-size: cover;
}

</style>
