<script>
import * as slugify from '@sindresorhus/slugify'
import creatorTitles from '@/store/constants/creatorTitles'
import BookListView from '@/components/BookListView'
import Filter from '@/components/Filter'
import PersonDetailLink from '@/components/PersonDetailLink'
import Tag from '@/components/Tag'
import SimpleInput from '@/components/fields/SimpleInput'

export default {
  components: {
    BookListView,
    Filter,
    PersonDetailLink,
    SimpleInput,
    Tag,
  },
  beforeRouteLeave(to, from, next) {
    // mark the user's visit once they navigate to any other page
    // used to show the one-time welcome messagein App.vue
    if (!this.$store.state.ui.lastVisited) {
      this.$store.commit('ui/setLastVisited', new Date())
    }
    next()
  },
  data() {
    return {
      creatorTitles,
      tagsDropdownActive: false,
      titleDropdownActive: false,
      pageUrl: window.location.href,
    }
  },
  computed: {
    bgImage() {
      if (!this.person.photo) return ''
      return typeof this.person.photo === 'string'
        ? this.person.photo
        : this.person.photo.url?.startsWith('http')
          ? this.person.photo.url
          : ''
    },
    books() {
      return this.person ? this.$store.getters['books/list']().filter(book =>
        (book.authors || []).includes(this.person.name) ||
        (book.illustrators || []).includes(this.person.name) ||
        Object.keys(book.creators || {}).includes(this.person.id)
      ) : []
    },
    name() {
      return this.$route.params.name
    },
    person() {
      const person = this.$store.getters['people/findBy']('name', name => slugify(name) === this.name)
      this.$store.dispatch('debug', { person })
      return person
    },
    tags() {
      const peopleTags = this.$store.state.tags.people.data || {}
      return Object.keys(this.person?.identities || [])
        .map(id => peopleTags[id])
        .filter(x => x)
    },
    tagOptions() {
      return this.$store.getters['tags/people/listSorted']()
    },
    /** Get the person's creatorTitle. */
    title() {
      if (!this.person) return null
      const title = this.creatorTitles.find(creatorTitle => creatorTitle.id === this.person.title)
      if (!title) {
        console.warn(`Missing titles. Defaulting to Author.`)
      }
      return title || this.creatorTitles.find(creatorTitle => creatorTitle.text === 'Author')
    },
  },
  watch: {
    '$store.state.people.data'(next, prev) {
      if (next && Object.keys(next).length && !next[this.person.id]) {
        // person not found! drop to 404
        // timeout to make router finish any his current work, if doing any
        setTimeout(() => {
          this.$router.push('/404')
        }, 0)
      }
    }
  },
  methods: {

    closeTagsDropdown() {
      this.tagsDropdownActive = false
    },

    closeTitleDropdown() {
      this.titleDropdownActive = false
    },

    addTag(tag) {
      this.closeTagsDropdown()
      this.$store.dispatch('people/update', {
        path: `${this.person.id}/identities`,
        value: {
          [tag.id]: true
        },
      })
    },

    removeTag(tag) {
      this.$store.dispatch('people/update', {
        path: `${this.person.id}/identities`,
        value: {
          [tag.id]: null
        },
      })
    },

    saveName(name) {
      this.$store.dispatch('people/update', {
        path: `${this.person.id}`,
        value: {
          name,
        },
      })
    },

    setTitle(creatorTitle) {
      this.closeTagsDropdown()
      this.$store.dispatch('people/update', {
        path: `${this.person.id}`,
        value: {
          title: creatorTitle.id
        },
      })
    },

  },
}

</script>

<template>

  <teleport to="#people-filter-menu">
    <Filter type="people" />
  </teleport>

  <div v-if="person" class="mx-5" :data-person-id="person.id">

    <div class="wide-page">

      <!-- back and view buttons -->
      <div class="is-flex is-justify-content-space-between mb-3">

        <div class="mb-5 is-narrow">
          <router-link :to="{ name: 'PeopleManager' }" class="is-uppercase is-primary">&lt; Back to People Manager</router-link>
        </div>

        <PersonDetailLink v-if="person" :person="person" class="button is-rounded is-primary">View Person</PersonDetailLink>

      </div>

      <div class="is-flex is-flex-direction-row is-flex-wrap-wrap">
        <div class="column-person" :class="{'with-bookmarks': $store.state.ui.bookmarksOpen}">
          <div class="cover-wrapper mb-20">
            <div v-if="bgImage.length" :style="{backgroundImage: `url(${bgImage})`}" class="cover-photo bg-secondary" />
          </div>

          <div class="title-container divider-30">

            <!-- title dropdown -->
            <div class="dropdown mt-4 no-user-select" :class="{ 'is-active': titleDropdownActive }">
              <div id="dropdown-menu" class="dropdown-menu" role="menu">
                <div class="dropdown-content" style="max-height: 19.5em; overflow: scroll;">
                  <a v-for="title in creatorTitles" :key="title.id" class="dropdown-item is-capitalized" @click.prevent="setTitle(title)">
                    {{ title.text }}
                  </a>
                </div>
              </div>
            </div>

            <!-- title -->
            <a v-if="title" @click.prevent.stop="titleDropdownActive = !titleDropdownActive" v-click-outside="closeTitleDropdown" class="primary-hover no-user-select" :class="{ 'is-primary': titleDropdownActive }">{{ title.text }}</a>

            <!-- name -->
            <h1 class="title mt-5">
              <SimpleInput @update:modelValue="saveName" v-model="person.name" placeholder="Enter Name" unstyled />
            </h1>

            <!-- tags -->
            <div class="tags mt-20">
              <Tag v-for="tag of tags" :key="tag.id" :tag="tag" type="people" @remove="removeTag" editable nolink />

              <!-- add tag -->
              <div class="dropdown mt-4 no-user-select" :class="{ 'is-active': tagsDropdownActive }">
                <div id="dropdown-menu" class="dropdown-menu" role="menu">
                  <div class="dropdown-content" style="max-height: 19.5em; overflow: scroll;">
                    <a v-for="tag in tagOptions" :key="tag.id" class="dropdown-item is-capitalized" @click.prevent="addTag(tag)">
                      {{ tag.tag }}
                    </a>
                  </div>
                </div>
              </div>

              <!-- tag -->
              <Tag :tag="{ tag: 'ADD TAG' }" nolink tagStyle="background-color: #999; cursor: pointer" v-click-outside="closeTagsDropdown" @click.prevent.stop="tagsDropdownActive = !tagsDropdownActive" />

            </div>

          </div>

          <p v-if="person.bio" class="person-bio" :innerHTML="person.bio" />

        </div>

        <div class="column-books" :class="{'with-bookmarks': $store.state.ui.bookmarksOpen}">
          <BookListView v-for="book of books" :key="book.id" :book="book" />
        </div>

      </div>

    </div>
  </div>

  <!-- Add a bottom spacer so that fixed position footer clears content when scrolled to the bottom. -->
  <div class="mb-7" />

</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/components/dropdown.sass";
@import '@/assets/style/mixins.scss';
@import '@/assets/style/vars.scss';

.wide-page {
  margin: 0 20px;
  max-width: $widescreen;
  @include from($desktop) {
    margin: 0 60px;
  }
}

.directory-nav-link {
  color: black;
}

.column-person {
  width: 100%;
  text-align: center;

  @include from($widescreen) {
    width: calc(50% - 20px);
    margin-right: 20px;
    text-align: left;
  }

  &.with-bookmarks {
    width: 100%;
    text-align: center;
  }
}

.column-books {
  width: 100%;

  @include from($widescreen) {
    width: calc(50% - 20px);
    margin-left: 20px;
  }

  &.with-bookmarks {
    width: 100%;
  }
}

.cover-wrapper {
  max-width: 180px;
  max-height: 180px;
  text-align: center;
  margin: auto;

  @include from($widescreen) {
    text-align: left;
    margin: 0;
  }
}

.cover-photo {
  @include primary(border-color);
  padding-top: 100%;
  width: 100%;
  border: 1px solid;
  border-radius: 50%;
  background-size: cover;
}

.title {
  line-height: 1;
  margin-bottom: 0;
}

.person-bio {
  @include primary(border-color);
  font-size: 22px;
  text-align: justify;
  padding-bottom: 30px;
  margin-bottom: 30px;
  border-bottom: solid 1px #ddd;

  @include from($widescreen) {
    text-align: left;
    border-bottom: none;
    padding-bottom: 0.5rem;
  }
}
</style>
