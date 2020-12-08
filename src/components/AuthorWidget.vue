<script>
export default {
  props: ['name', 'size', 'nolink'],
  data() {
    return {
      person: null,
      fontSize: this.size || 100
    }
  },
  created() {
    this.person = this.$store.state.peopleList.reduce((acc, x) => x.name === this.name ? x : acc, null)
  },
  computed: {
    isAuthor() {
      if (!this.person) {
        return true
      }
      return this.person.role === 'author'
    }
  }
}
</script>

<template>
  <div class="mb-3 is-uppercase widget" :style="{'font-size': this.fontSize+'%'}">
    <i v-if="isAuthor" class="fas fa-pencil-alt"></i>
    <i v-if="!isAuthor" class="fas fa-palette"></i>
    <div v-if="nolink === true" class="name ml-2">{{name}}</div>
    <router-link v-else :to="{name: 'PersonDetail', params: {id: person.id}}" class="name ml-2">{{name}}</router-link>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

.widget {
  // font-size: 10px;
  color: black !important;
  font-weight: bold;

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
