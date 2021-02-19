<script>
import PersonDetailLink from '@/components/PersonDetailLink'

export default {
  components: {
    PersonDetailLink,
  },
  props: {
    // link to admin edit pages instead of public detail pages
    edit: Boolean,
    id: {
      required: true,
      type: String,
    },
    role: {
      required: true,
      type: String,
    },
  },
  data() {
    return {
      people: []
    }
  },
  computed: {
    creator() {
      const person = this.$store.state.people.data?.[this.id]
      return person ? {
        ...person,
        role: this.role
      } : null
    },
    photoUrl() {
      return this.creator?.photo?.url || this.creator?.photo
    },
    roleIntro() {
      const intro = this.role === 'author' ? 'words '
        : this.role === 'illustrator' ? 'pictures '
        : ''
      return `${intro}by`
    },
  }
}
</script>

<template>

  <div class="is-flex is-uppercase mb-10" style="line-height: 1.7;">

    <PersonDetailLink v-if="creator" :person="creator" :edit="edit" class="primary-hover"><div class="bg-secondary" :style="{
      minWidth: '70px',
      minHeight: '70px',
      width: '70px',
      height: '70px',
      borderRadius: '999px',
      marginRight: '10px',
      overflow: 'hidden',
    }">
      <div v-if="photoUrl" :style="{
        backgroundImage: `url(${photoUrl})`,
        backgroundSize: 'cover',
        height: '100%',
        width: '100%',
      }" />
    </div></PersonDetailLink>

    <div class="mt-20">
      <div class="mr-2" style="font-weight: bold; white-space: nowrap;">{{ roleIntro }}</div>

      <PersonDetailLink v-if="creator" :person="creator" :edit="edit" class="primary-hover">{{ creator.name }}</PersonDetailLink>
    </div>

  </div>

</template>
