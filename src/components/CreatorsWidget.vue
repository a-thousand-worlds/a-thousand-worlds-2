<script>
import PersonDetailLink from '@/components/PersonDetailLink'

export default {
  components: {
    PersonDetailLink,
  },
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
  watch: {
    '$store.state.creators.data'(next) {
      this.recalculate()
    }
  },
  created() {
    this.recalculate()
  },
  methods: {
    recalculate() {
      this.people = Object.keys(this.creators || {})
        .map(creatorId => ({ person: this.$store.state.creators.data?.[creatorId] || null, role: this.creators[creatorId] }))
    }
  },
}
</script>

<template>
  <div class="widget is-uppercase">
    <div class="person-block">
      <span class="comma mr-2">by</span>
      <span v-for="(person, i) of authors" :key="i">
        <PersonDetailLink v-if="person.person && linked" :person="person.person" class="name">{{ person.person.name }}</PersonDetailLink>
        <span v-if="person.person && !linked" class="name">{{ person.person?.name }}</span>
        <span v-if="authors?.length > 1 && i !== authors?.length - 1" class="comma mr-2">,</span>
      </span>
    </div>
    <div v-if="illustrators.length" class="person-block">
      <span class="comma mr-2">illustrated by</span>
      <span v-for="(person, i) of authors" :key="i">
        <PersonDetailLink v-if="person.person && linked" :person="person.person" class="name">{{ person.person.name }}</PersonDetailLink>
        <span v-if="person.person && !linked" class="name">{{ person.person.name }}</span>
        <span v-if="authors.length > 1 && i !== authors?.length - 1" class="comma mr-2">,</span>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";

.widget {
  // font-size: 10px;
  color: black !important;

  .name {
    color: #000;
    white-space: nowrap;
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
