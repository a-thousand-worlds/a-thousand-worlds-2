<script>
import PersonDetailLink from '@/components/PersonDetailLink'

export default {
  components: {
    PersonDetailLink,
  },
  props: ['name', 'size', 'nolink'],
  data() {
    return {
      person: null,
      fontSize: this.size || 100
    }
  },
  computed: {
    isAuthor() {
      return !this.person || this.person.role === 'author'
    }
  },
  watch: {
    '$store.state.creators.data'(next) {
      this.person = this.$store.getters['creators/list']().find(x => x.name === this.name)
    }
  },
  created() {
    this.person = this.$store.getters['creators/list']().find(x => x.name === this.name)
  }
}
</script>

<template>
  <div class="mb-3 is-uppercase widget" :style="{'font-size': fontSize+'%'}">
    <span v-if="!isAuthor">illustrated </span>
    <span>by </span>
    <span v-if="nolink || !person" class="name">{{ name }}</span>
    <PersonDetailLink v-else :person="person" class="name">{{ name }}</PersonDetailLink>
  </div>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";

.widget {
  // font-size: 10px;
  color: black !important;

  a.name {
    color: #000;
  }
}

.person-block {
  width: 100%;
  margin-bottom: 20px;

  @include from($tablet) {
    width: 50%;
  }

  @include from($desktop) {
    width: 33%;
  }

  @include from($widescreen) {
    width: 25%;
  }

}

</style>
