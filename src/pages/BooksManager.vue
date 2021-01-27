<script>
import _ from 'lodash'
import dayjs from 'dayjs'
import BookDetailLink from '@/components/BookDetailLink'
import SortableTableHeading from '@/components/SortableTableHeading'
import StaticBookCover from '@/components/StaticBookCover'
import { remove as diacritics } from 'diacritics'

/** Generates a sort token that will sort empty strings to the end regardless of sort direction. */
const sortEmptyToEnd = (s, dir) =>
  `${dir === 'asc' && s === '' ? 1 : 0}-${s}`

export default {
  name: 'BooksManager',
  components: {
    BookDetailLink,
    SortableTableHeading,
    StaticBookCover,
  },
  data() {
    return {
      search: '',
      sortConfig: {
        field: 'created',
        dir: 'desc',
      },
    }
  },

  computed: {

    books() {

      // sort books by the sort config
      const sort = list => {
        const sorted = _.sortBy(list, [
          book => this.sortConfig.field === 'authors' ? sortEmptyToEnd(this.authors(book.creators), this.sortConfig.dir)
          : this.sortConfig.field === 'illustrators' ? sortEmptyToEnd(this.illustrators(book.creators), this.sortConfig.dir)
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
          this.authors(book.creators),
          this.illustrators(book.creators)
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

  methods: {

    authors(creators) {
      const people = this.$store.state.people.data
      return Object.entries(creators)
        .filter(([id, value]) => value === 'author')
        .map(([id, value]) => people[id]?.name)
        .join(', ')
    },

    formatDate(d) {
      return dayjs(d).format('M/D/YYYY hh:mm')
    },

    illustrators(creators) {
      const people = this.$store.state.people.data
      return Object.entries(creators)
        .filter(([id, value]) => value === 'illustrator')
        .map(([id, value]) => people[id]?.name)
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
        <router-link :to="{ name: 'Dashboard' }" class="is-uppercase is-primary">&lt; Back to Dashboard</router-link>
      </div>

      <h1 class="title divider-bottom mb-30">Books Manager</h1>

      <div class="mb-30 is-flex is-justify-content-space-between">
        <router-link class="button is-rounded is-primary mr-20" :to="{name:'BookManagerAddForm'}">Add Book</router-link>
        <div class="is-flex is-align-items-center">
          <i class="fas fa-search" style="transform: translateX(23px); z-index: 10; opacity: 0.3;" />
          <input v-model="search" class="input" placeholder="Search" style="padding-left: 30px;">
        </div>
      </div>

      <div v-if="!books.length" class="w-100 my-100 has-text-centered">
        <h2 class="mb-20">No matching books</h2>
        <p><a @click.prevent="search = ''" class="button is-rounded is-primary">Reset Search</a></p>
      </div>

      <table v-else class="table w-100">
        <thead>
          <tr>
            <td />
            <SortableTableHeading id="isbn" v-model="sortConfig">ISBN</SortableTableHeading>
            <SortableTableHeading id="titleLower" v-model="sortConfig">Title</SortableTableHeading>
            <SortableTableHeading id="authors" v-model="sortConfig">Author(s)</SortableTableHeading>
            <SortableTableHeading id="illustrators" v-model="sortConfig">Illustrator(s)</SortableTableHeading>
            <SortableTableHeading id="created" v-model="sortConfig" default="desc" class="has-text-right pr-20">Created</SortableTableHeading>
            <th class="has-text-right">Delete</th>
          </tr>
        </thead>
        <tbody>

          <tr v-for="book of books" :key="book.id" :data-book-id="book.id">

            <!-- cover -->
            <td>
              <BookDetailLink :book="book">
                <StaticBookCover :book="book" style="width: 150px; min-width: 50px; min-height: auto;" />
              </BookDetailLink>
            </td>

            <!-- ISBN -->
            <td>{{ book.isbn }}</td>

            <!-- title -->
            <td>{{ book.title }}</td>

            <!-- author(s) -->
            <td>{{ authors(book.creators) }}</td>

            <!-- illustrator(r) -->
            <td>{{ illustrators(book.creators) }}</td>

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

</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/elements/table.sass";
@import "bulma/sass/form/shared.sass";
@import "bulma/sass/form/checkbox-radio.sass";

.table {

  th {
    user-select: none;
  }

  td {
    vertical-align: middle;
  }

}

</style>
