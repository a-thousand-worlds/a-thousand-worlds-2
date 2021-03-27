<script>
import _ from 'lodash'
import dayjs from 'dayjs'
import BookDetailLink from '@/components/BookDetailLink'
import PersonDetailLink from '@/components/PersonDetailLink'
import Loader from '@/components/Loader'
import SortableTableHeading from '@/components/SortableTableHeading'
import StaticCoverImage from '@/components/StaticCoverImage'
import { remove as diacritics } from 'diacritics'

/** Generates a sort token that will sort empty strings to the end regardless of sort direction. */
const sortEmptyToEnd = (s, dir) =>
  `${dir === 'asc' && s === '' ? 1 : 0}-${s}`

export default {
  name: 'BooksManager',
  components: {
    BookDetailLink,
    Loader,
    PersonDetailLink,
    SortableTableHeading,
    StaticCoverImage,
  },
  data() {
    const sortField = this.$route.query?.sort || 'created'
    return {
      search: this.$route.query?.search || '',
      sortConfig: {
        field: sortField,
        dir: this.$route.query?.dir || (sortField === 'created' ? 'desc' : 'asc'),
      },
    }
  },

  computed: {

    loaded() {
      return this.$store.state.books.loaded
    },

    books() {

      // sort books by the sort config
      const sort = list => {
        const sorted = _.sortBy(list, [
          book => this.sortConfig.field === 'authors' ? sortEmptyToEnd(this.authorsString(book.creators), this.sortConfig.dir)
          : this.sortConfig.field === 'illustrators' ? sortEmptyToEnd(this.illustratorsString(book.creators), this.sortConfig.dir)
          : book[this.sortConfig.field],
          'titleLower'
        ])
        return this.sortConfig.dir === 'desc' ? _.reverse(sorted) : sorted
      }

      // filter books by the active search
      const filter = list => this.search
        ? list.filter(book => diacritics([
          book.created,
          book.isbn,
          book.title,
          this.authorsString(book.creators),
          this.formatContributor(book.createdBy),
          this.illustratorsString(book.creators)
        ].join(' ')).toLowerCase().includes(diacritics(this.search.trim()).toLowerCase()))
        : list

      return sort(filter(this.booksList))
    },

    booksList() {
      return this.$store.getters['books/list']()
        .map(book => ({
          ...book,
          titleLower: book.title.toLowerCase(),
        }))
    }

  },

  watch: {

    // update search query param on change
    search: _.debounce(function(next, prev) {
      this.$router.replace({
        ...this.$route,
        query: {
          ...this.$route.query,
          search: next || undefined,
        },
      })
    }, 200),

    // update sort query param on change
    sortConfig: _.debounce(function(next, prev) {
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

    authors(creators) {
      const people = this.$store.state.people.data || {}
      return Object.entries(creators || {})
        .filter(([id, value]) => value === 'author' || value === 'both')
        .map(([id, value]) => people[id])
        .filter(x => x)
    },

    authorsString(creators) {
      return this.authors(creators)
        .map(author => author?.name)
        .join(', ')
    },

    formatContributor(contributorId) {
      return this.$store.getters['users/get'](contributorId)?.profile?.name
    },

    formatDate(d) {
      return dayjs(d).format('M/D/YYYY hh:mm')
    },

    illustrators(creators) {
      const people = this.$store.state.people.data || {}
      return Object.entries(creators || {})
        .filter(([id, value]) => value === 'illustrator')
        .map(([id, value]) => people[id])
        .filter(x => x)
    },

    illustratorsString(creators) {
      return this.illustrators(creators)
        .map(illustrator => illustrator?.name)
        .join(', ')
    },

    async remove(id) {
      this.$store.commit('ui/setBusy', true)
      try {
        await this.$store.dispatch('books/remove', id)
      }
      finally {
        this.$store.commit('ui/setBusy', false)
      }
    },

  }
}

</script>

<template>

  <div class="is-flex is-justify-content-center m-20 mb-40">
    <div class="is-flex-grow-1 mx-20" style="max-width: 900px;">

      <div class="mb-5">
        <a @click.prevent="$router.back" class="is-uppercase is-primary">&lt; Back</a>
      </div>

      <h1 class="title divider-bottom mb-30">Books Manager</h1>

      <div class="mb-30 is-flex is-justify-content-space-between">
        <div>
          <router-link class="mr-20" :to="{ name:'TagsManager' }" style="color: black; line-height: 2.5;">Book Tags</router-link>
        </div>
        <div class="is-flex is-align-items-center">
          <span class="has-text-right" v-tippy="{ content: `Search by ISBN, title, creator, or date created` }" style="white-space: nowrap;"><i class="far fa-question-circle" /></span>
          <i class="fas fa-search" style="transform: translateX(23px); z-index: 10; opacity: 0.3;" />
          <input v-model="search" placeholder="Search" class="input pl-30">
        </div>
      </div>

      <div v-if="!loaded" class="has-text-centered" style="margin-top: 20vh;">
        <Loader />
      </div>

      <div v-else>

        <div v-if="!books.length" class="w-100 my-100 has-text-centered">
          <h2 class="mb-20">No {{ search ? 'matching ' : '' }}books{{ !search ? ' yet!' : '' }}</h2>
          <p v-if="search"><a @click.prevent="search = ''" class="button is-rounded is-primary">Reset Search</a></p>
        </div>

        <table v-else class="table w-100">
          <thead>
            <tr>
              <td />
              <SortableTableHeading id="isbn" v-model="sortConfig">ISBN</SortableTableHeading>
              <SortableTableHeading id="titleLower" v-model="sortConfig">Title</SortableTableHeading>
              <SortableTableHeading id="authors" v-model="sortConfig">Author(s)</SortableTableHeading>
              <SortableTableHeading id="illustrators" v-model="sortConfig">Illustrator(s)</SortableTableHeading>
              <SortableTableHeading id="contributor" v-model="sortConfig">Contributor</SortableTableHeading>
              <SortableTableHeading id="created" v-model="sortConfig" default="desc" class="has-text-right pr-20">Created</SortableTableHeading>
              <th class="has-text-right">Delete</th>
            </tr>
          </thead>
          <tbody>

            <tr v-for="book of books" :key="book.id" :data-book-id="book.id">

              <!-- cover -->
              <td>
                <BookDetailLink :book="book" edit>
                  <StaticCoverImage :item="book" style="width: 150px; min-width: 50px; min-height: auto;" />
                </BookDetailLink>
              </td>

              <!-- ISBN -->
              <td><BookDetailLink :book="book" edit>{{ book.isbn }}</BookDetailLink></td>

              <!-- title -->
              <td><BookDetailLink :book="book" edit>{{ book.title }}</BookDetailLink></td>

              <!-- author(s) -->
              <td>
                <span v-for="(author, i) of authors(book.creators)" :key="author.id">
                  <span v-if="i !== 0">, </span><PersonDetailLink :person="author" edit>{{ author.name }}</PersonDetailLink>
                </span>
              </td>

              <!-- illustrator(s) -->
              <td>
                <span v-for="(illustrator, i) of illustrators(book.creators)" :key="illustrator.id">
                  <span v-if="i !== 0">, </span><PersonDetailLink :person="illustrator" edit>{{ illustrator.name }}</PersonDetailLink>
                </span>
              </td>

              <!-- contributor -->
              <td>
                {{ formatContributor(book.createdBy) }}
              </td>

              <!-- created -->
              <td class="has-text-right">{{ formatDate(book.created) }}</td>

              <!-- edit/delete -->
              <td class="has-text-right">
                <div class="field is-grouped is-justify-content-flex-end">
                  <p class="control">
                    <button :disabled="$uiBusy" class="button is-flat" @click.prevent="remove(book.id)">
                      <i class="fas fa-times" />
                    </button></p>
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
