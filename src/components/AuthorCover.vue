<script>
import AuthorWidget from '@/components/AuthorWidget'

export default {
  props: ['person', 'colorI'],
  components: {
    AuthorWidget,
  },
  created() {
    if (this.person.photo && this.person.photo.length) {
      this.$store.dispatch('loadImage', this.person.photo)
    }
  },
  computed: {
    bgColor(i) {
      const colors = ['#fefad2', '#98ba93', '#d4c0d6', '#fcf1f5', '#fcebd0', '#f3fef1']
      return colors[parseInt(this.colorI) % colors.length]
    },
    bgImage() {
      return this.person.photo && this.person.photo.length ? this.$store.state.images[this.person.photo] || '' : ''
    }
  }
}

</script>

<template>
<router-link :to="{name:'PersonDetail', params: {id: person.id}}">
  <div :style="{backgroundColor: bgColor, backgroundImage: 'url('+bgImage+')'}" class="photo-wrapper">
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
