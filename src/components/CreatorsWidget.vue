<script>
export default {
  props: ['creators', 'linked'],
  data() {
    return {
      people: []
    }
  },
  computed: {
    authors() {
      return this.people.filter(info => info.role === 'both' || info.role === 'author')
    },
    illustrators() {
      return this.people.filter(info => info.role === 'both' || info.role === 'illustrator')
    }
  },
  created() {
    this.recalculate()
  },
  methods: {
    recalculate() {
      this.people = Object.keys(this.creators || {})
        .map(creatorId => ({ person: this.$store.state.creators.data[creatorId] || null, role: this.creators[creatorId] }))
    }
  },
  watch: {
    '$store.state.creators.data'(next) {
      this.recalculate()
    }
  },
}
</script>

<template>
  <div class="widget is-uppercase">
    <div class="person-block">
      <span class="comma mr-2">by</span>
      <span v-for="(person, i) of authors" :key="i">
        <router-link class="name" v-if="person.person && linked" :to="{name: 'PersonDetail', params: {id: person.person.id}}" >{{person.person.name}}</router-link>
        <span class="name" v-if="person.person && !linked">{{person.person?.name}}</span>
        <span class="comma mr-2" v-if="authors?.length > 1 && i !== authors?.length - 1">,</span>
      </span>
    </div>
    <div class="person-block" v-if="illustrators.length">
      <span class="comma mr-2">illustrated by</span>
      <span v-for="(person, i) of authors" :key="i">
        <router-link class="name" v-if="person.person && linked" :to="{name: 'PersonDetail', params: {id: person.person.id}}" >{{person.person.name}}</router-link>
        <span class="name" v-if="person.person && !linked">{{person.person.name}}</span>
        <span class="comma mr-2" v-if="authors.length > 1 && i !== authors?.length - 1">,</span>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

.widget {
  // font-size: 10px;
  color: black !important;

  .name {
    color: #000;
    white-space: nowrap;
  }
}

.comma {
  white-space: nowrap;
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
