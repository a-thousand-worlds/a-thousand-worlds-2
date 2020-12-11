<script>
import AuthorWidget from '@/components/AuthorWidget'

export default {
  props: ['person'],
  components: {
    AuthorWidget,
  },
  created() {
    if (this.person.photo && this.person.photo.length) {
      this.$store.dispatch('loadImage', this.person.photo)
    }
  },
  computed: {
    bgImage() {
      return this.person.photo?.length ? this.$store.state.images[this.person.photo] || '' : ''
    }
  }
}

</script>

<template>
<router-link :to="{name:'PersonDetail', params: {id: person.id}}">
  <div :style="{backgroundImage: 'url('+bgImage+')'}" class="photo-wrapper bg-secondary">
  </div>
  <author-widget :name="person.name" :size="120"/>
</router-link>

</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

/**/
.photo-wrapper {
  width: 100%;
  padding-top: 100%;
  border: 1px solid $atw-base;
  border-radius: 50%;
  background-size: cover;
}

/**/
</style>
