<script>
import sortBy from 'lodash/sortBy'
import reverse from 'lodash/reverse'
import debounce from 'lodash/debounce'
import dayjs from 'dayjs'
import { remove as diacritics } from 'diacritics'
import creatorTitles from '@/store/constants/creatorTitles'

import AddTag from '@/components/AddTag'
import CoverImage from '@/components/CoverImage'
import DeletePersonButton from '@/components/DeletePersonButton'
import Dropdown from '@/components/Dropdown'
import HighlightedText from '@/components/HighlightedText'
import Loader from '@/components/Loader'
import PersonDetailLink from '@/components/PersonDetailLink'
import SortableTableHeading from '@/components/SortableTableHeading'
import Tag from '@/components/Tag'

/** Generates a sort token that will sort empty strings to the end regardless of sort direction. */
const sortEmptyToEnd = (s, dir) =>
  `${dir === 'asc' && s === '' ? 1 : 0}-${s}`

export default {
  name: 'PeopleManager',
  components: {
    AddTag,
    CoverImage,
    DeletePersonButton,
    Dropdown,
    HighlightedText,
    Loader,
    PersonDetailLink,
    SortableTableHeading,
    Tag,
  },
  data() {
    const sortField = this.$route.query?.sort || 'created'
    return {
      creatorTitles,
      editMode: false,
      // edit mode takes is slow to render, so show a Loader during the delay
      loadingEditMode: false,
      search: this.$route.query?.search || '',
      sortConfig: {
        field: sortField,
        dir: this.$route.query?.dir || (sortField === 'created' ? 'desc' : 'asc'),
      },
    }
  },

  computed: {

    loaded() {
      return this.$store.state.people.loaded
    },

    people() {

      // sort people by the sort config
      const sort = people => {
        const sorted = sortBy(people, [
          person => this.sortConfig.field === 'title' ? sortEmptyToEnd((person.title || person.role || '').toLowerCase(), this.sortConfig.dir)
          : this.sortConfig.field === 'created' ? dayjs(person.created)
          : this.sortConfig.field === 'tags' ? sortEmptyToEnd(this.getTags(person).map(tag => tag.tag).join(' '), this.sortConfig.dir)
          : this.sortConfig.field === 'updated' ? dayjs(person.updated)
          : (person[this.sortConfig.field] || '').toLowerCase(),
          'nameLower'
        ])
        return this.sortConfig.dir === 'desc' ? reverse(sorted) : sorted
      }

      // filter people by the active search
      const filter = people => this.search
        ? people.filter(person => this.searchPredicate(person))
        : people

      return sort(filter(this.peopleList))
    },

    peopleList() {
      return this.$store.getters['people/list']()
        .map(person => ({
          ...person,
          nameLower: person.name.toLowerCase(),
        }))
    },

    tags() {
      return this.$store.getters[`tags/people/listSorted`]()
    },

  },

  watch: {

    // update search query param on change
    search: debounce(function(next, prev) {
      this.$router.replace({
        ...this.$route,
        query: {
          ...this.$route.query,
          search: next || undefined,
        },
      })
    }, 200),

    // update sort query param on change
    sortConfig: debounce(function(next, prev) {
      this.$router.replace({
        ...this.$route,
        query: {
          ...this.$route.query,
          sort: next.field,
          dir: next.dir,
        },
      })
    }, 200),

  },

  methods: {

    formatDate(d) {
      return dayjs(d).format('M/D/YYYY hh:mm')
    },

    formatTitle(person) {
      const creatorTitleObject = creatorTitles.find(o => o.id === person.title || o.id === person.role)
      return creatorTitleObject?.text
    },

    getTags(person) {
      const tagsState = this.$store.state.tags.people
      return tagsState.loaded
        ? Object.keys(person.identities || {})
          .map(tagId => tagsState.data[tagId] || { id: tagId, tag: 'invalid' })
        : null
    },

    /** Returns true if a string matches the search term (trimmed, lowercased, and diacritics removed). */
    isMatch(value, search) {
      return diacritics(value.trim()).toLowerCase().includes(diacritics(search.trim()).toLowerCase())
    },

    /** Returns true if the person matches the search. Case insensitive, partial match, support for filtering by field, e.g. tag:poetry */
    searchPredicate(person) {

      const split = this.search.split(':')
      const field = split.length > 1 ? split[0].trim().toLowerCase() : null
      const searchValue = split.length > 1 ? split[1] : split[0]

      // map fields to formating functions
      const format = {
        name: person.name,
        created: this.formatDate(person.created),
        title: this.formatTitle(person),
        tag: this.getTags(person).map(tag => tag.tag).join(' ')
      }

      return field
        ? this.isMatch(format[field] || '', searchValue)
        : Object.values(format)
          .map(s => (s || '').toLowerCase())
          .some(s => this.isMatch(s, searchValue))
    },

    toggleEditMode() {
      // show a loader while edit mode is rendering
      this.loadingEditMode = true
      setTimeout(() => {
        this.editMode = !this.editMode
        this.loadingEditMode = false
      })
    },

    toggleTagSearch(tag) {
      const term = `tag:${tag.tag}`

      if (this.search.includes(term)) {
        this.search = this.search.replace(term, '')
      }
      else {
        // replace search until better search logic is implemented
        this.search = term
        // this.search = `${this.search} ${term}`.trim()
      }
    },

    updatePerson(person, field, value) {
      if (value === undefined) {
        value = field
        field = ''
      }

      // console.log('field', field)
      // console.log('value', value)

      // do not update if the field is not changed
      // handle field embedded in complex value, e.g. field === '' and value === { isbn: '1419742256' }
      if (person[field] === value) return
      const extractedField = field === '' && Object.keys(value).length === 1 && Object.keys(value)[0]
      if (extractedField && person[extractedField] === value[extractedField]) return

      // console.log('update', {
      //   path: `${person.id}/${field}`,
      //   value,
      // })

      this.$store.dispatch('people/update', {
        path: `${person.id}/${field}`,
        value,
      })
    },

  },
}

</script>

<template>

  <div class="is-flex is-justify-content-center m-20 mb-40">
    <div class="is-flex-grow-1 mx-20" style="max-width: 900px;">

      <div class="mb-5">
        <a @click.prevent="$router.back" class="is-uppercase is-primary">&lt; Back</a>
      </div>

      <h1 class="title divider-bottom mb-30">People Manager</h1>

      <div class="mb-30 is-flex is-justify-content-space-between">
        <div>
          <router-link class="mr-20" :to="{ name:'TagsManager', query: { active: 'people' } }" style="color: black; line-height: 2.5;">People Tags</router-link>
        </div>
        <div class="is-flex is-align-items-center">

          <!-- EDIT/DONE link -->
          <span style="white-space: nowrap;">
            <Loader v-if="loadingEditMode" class="mr-1" style="display: inline-block; width: 1em; height: 1em;" />
            <a @click.prevent="toggleEditMode" class="mr-40">
              {{ editMode ? 'DONE' : 'EDIT' }}
            </a>
          </span>

          <!-- # creators -->
          <span v-if="loaded" class="mr-40" style="white-space: nowrap">{{ people.length }} creator{{ people.length === 1 ? '' : 's' }} <span v-if="search">(filtered)</span></span>

          <!-- search -->
          <span class="has-text-right" v-tippy="{ content: `Search all creators. Use 'field:value' to filter by a specific field, e.g. 'tag:Asian'` }" style="white-space: nowrap;"><i class="far fa-question-circle" /></span>
          <i class="fas fa-search" style="transform: translateX(23px); z-index: 10; opacity: 0.3;" />
          <input v-model="search" placeholder="Search" class="input pl-30">

        </div>
      </div>

      <div v-if="!loaded" class="has-text-centered" style="margin-top: 20vh;">
        <Loader />
      </div>

      <div v-else>

        <div v-if="!people.length" class="w-100 my-100 has-text-centered">
          <h2 class="mb-20">No {{ search ? 'matching ' : '' }}people{{ !search ? ' yet!' : '' }}</h2>
          <p v-if="search"><a @click.prevent="search = ''" class="button is-rounded is-primary">Reset Search</a></p>
        </div>

        <table v-else class="table w-100">
          <thead>
            <tr>
              <td />
              <SortableTableHeading id="nameLower" v-model="sortConfig">Name</SortableTableHeading>
              <SortableTableHeading id="tags" v-model="sortConfig">Tags</SortableTableHeading>
              <SortableTableHeading id="title" v-model="sortConfig">Title</SortableTableHeading>
              <SortableTableHeading id="created" v-model="sortConfig" default="desc" class="has-text-right pr-20">Created</SortableTableHeading>
              <th class="has-text-right">Delete</th>
            </tr>
          </thead>
          <tbody>

            <tr v-for="person of people" :key="person.id" :data-person-id="person.id">

              <!-- photo -->
              <td>
                <PersonDetailLink :person="person" edit>
                  <CoverImage :item="person" style="width: 100px; border-radius: 99px;" />
                </PersonDetailLink>
              </td>

              <!-- name -->
              <td>
                <PersonDetailLink :person="person" edit>
                  <HighlightedText field="name" :search="search">
                    {{ person.name }}
                  </HighlightedText>
                </PersonDetailLink>
              </td>

              <!-- tags -->
              <td>
                <Tag
                  v-for="tag of getTags(person)"
                  :key="tag.id"
                  :tag="tag"
                  type="people"
                  @click="editMode ? null : toggleTagSearch"
                  @remove="updatePerson(person, 'identities', { [tag.id]: null })"
                  nolink
                  :editable="editMode"
                  :button-class="{ 'is-outlined': true, pointer: !editMode }"
                >
                  <HighlightedText field="tag" :search="search">
                    {{ tag.tag }}
                  </HighlightedText>
                </Tag>
                <AddTag v-if="editMode" type="people" :item="person" />
              </td>

              <!-- title -->
              <td>

                <Dropdown v-if="person.title && editMode" :defaultValue="person.title" labelStyle="font-weight: bold;" :options="creatorTitles" @update:modelValue="updatePerson(person, '', { title: $event })" style="display: inline;" />

                <HighlightedText v-else field="title" :search="search">
                  {{ formatTitle(person) }}
                </HighlightedText>
              </td>

              <!-- created -->
              <td class="has-text-right">
                <HighlightedText field="created" :search="search">
                  {{ formatDate(person.created) }}
                </HighlightedText>
              </td>

              <!-- delete -->
              <td class="has-text-right">
                <div class="field is-grouped is-justify-content-flex-end">
                  <p class="control">
                    <DeletePersonButton :person="person" />
                  </p>
                </div>
              </td>

            </tr>

          </tbody>
        </table>
      </div>

    </div>
  </div>

</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/elements/table.sass";
</style>

<style lang="scss">
.pointer span {
  cursor: pointer !important;
}
</style>
