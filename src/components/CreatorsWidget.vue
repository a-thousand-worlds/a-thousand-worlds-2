<script>
import PersonDetailLink from '@/components/PersonDetailLink'

export default {
  components: {
    PersonDetailLink,
  },
  props: {
    creators: {},
    linked: Boolean,
    // link to admin edit pages instead of public detail pages
    edit: Boolean,
  },
  data() {
    return {
      people: []
    }
  },
  computed: {
    peopleList() {
      return Object.keys(this.creators || {})
        .map(creatorId => ({ person: this.$store.state.people.data?.[creatorId] || null, role: this.creators[creatorId] }))
    },
    authors() {
      return this.peopleList.filter(info => info.role === 'both' || info.role === 'author')
    },
    illustrators() {
      return this.peopleList.filter(info => info.role === 'both' || info.role === 'illustrator')
    },
    illustratorsSame() {
      return this.authors.every(creator => creator.role === 'both')
    },
  }
}
</script>

<template>
  <div class="creators-widget is-uppercase" style="margin-right: -5px;">

    <div class="mb-10">
      <b class="mr-2" style="white-space: nowrap;">{{ illustratorsSame ? '' : 'words ' }}by</b>
      <!-- allow long names to push a few pixels into the padding before wrapping -->
      <span v-for="(person, i) of authors" :key="i">
        <PersonDetailLink v-if="person.person && linked" :person="person.person" :edit="edit" class="name linked">{{ person.person.name }}</PersonDetailLink>
        <span v-if="person.person && !linked" class="name">{{ person.person?.name }}</span>
        <span v-if="authors?.length > 1 && i !== authors?.length - 1" class="mr-2">,</span>
      </span>
    </div>

    <div v-if="!illustratorsSame && illustrators.length" class="mb-10">
      <b class="mr-2" style="white-space: nowrap;">pictures by</b>
      <!-- allow long names to push a few pixels into the padding before wrapping -->
      <span v-for="(person, i) of illustrators" :key="i">
        <PersonDetailLink v-if="person.person && linked" :person="person.person" :edit="edit" class="name linked">{{ person.person.name }}</PersonDetailLink>
        <span v-if="person.person && !linked" class="name">{{ person.person.name }}</span>
        <span v-if="illustrators.length > 1 && i !== illustrators?.length - 1" class="mr-2">,</span>
      </span>
    </div>

  </div>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/style/mixins.scss';

.creators-widget {
  color: black !important;

  .name {
    color: #000;

    &.linked:hover {
      @include primary(color);
    }
  }
}

</style>
