<script>
// import AuthorWidget from '@/components/AuthorWidget'

export default {
  props: ['person'],
  computed: {
    bgImage() {
      return this.person.photo
    }
  },
  /*
  components: {
    AuthorWidget,
  },
  */
  created() {
    if (this.person.photo && this.person.photo.length) {
      // this.$store.dispatch('loadImage', this.person.photo)
    }
  }
}

</script>

<template>
  <router-link :to="{name:'PersonDetail', params: {id: person.id}}">
    <div :style="{backgroundImage: 'url('+bgImage+')'}" class="photo-wrapper bg-secondary" />
    <router-link :to="{name: 'PersonDetail', params: {id: person.id}}" class="is-uppercase">{{ person.name }}</router-link>
  </router-link>

</template>

<style scoped lang="scss">
@import '@/assets/vars.scss';
@import '@/assets/mixins.scss';

a {
  color: #000;
  font-size: 110%;
}
/**/
.photo-wrapper {
  @include primary(border-color);
  width: 100%;
  padding-top: 100%;
  border: 1px solid;
  border-radius: 50%;
  background-size: cover;
}

/**/
</style>
