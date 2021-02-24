<script>
import PersonDetailLink from '@/components/PersonDetailLink'
import creatorTitles from '@/store/constants/creatorTitles'

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
  emits: ['updateTitle'],
  data() {
    return {
      creatorTitles,
      titleDropdownActive: false,
    }
  },
  computed: {
    creator() {
      return this.$store.state.people.data?.[this.id]
    },
    photoUrl() {
      return this.creator?.photo?.url || this.creator?.photo
    },
    titleIntro() {
      const intro = this.role === 'author' ? 'words '
        : this.role === 'illustrator' ? 'pictures '
        : ''
      return `${intro}by`
    },
  },
  methods: {

    // function declaration needed for v-click-outside
    closeTitleDropdown() {
      this.titleDropdownActive = false
    },

    updateTitle(titleId) {
      this.closeTitleDropdown()
      this.$emit('updateTitle', titleId)
    },

  },
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
      <div class="mr-2">
        <div style="font-weight: bold; white-space: nowrap;">
          <a v-if="edit" v-click-outside="closeTitleDropdown" @click.prevent.stop="titleDropdownActive = !titleDropdownActive" style="user-select: none;" :class="{ 'primary-hover': edit, 'is-primary': titleDropdownActive }">{{ titleIntro }}</a>
          <span v-else>{{ titleIntro }}</span>
        </div>

        <!-- title dropdown -->
        <div v-if="edit" class="dropdown no-user-select" :class="{ 'is-active': titleDropdownActive }" style="position: absolute;">
          <div id="dropdown-menu" class="dropdown-menu" role="menu">
            <div class="dropdown-content" style="max-height: 19.5em; overflow: scroll;">
              <a v-for="title in creatorTitles" :key="title.id" class="dropdown-item is-capitalized" @click.prevent="updateTitle(title.id)">
                {{ title.text }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <PersonDetailLink v-if="creator" :person="creator" :edit="edit" class="primary-hover">{{ creator.name }}</PersonDetailLink>
    </div>

  </div>

</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/components/dropdown.sass";
@import '@/assets/style/vars.scss';
</style>
