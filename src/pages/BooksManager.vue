<script>
import dayjs from 'dayjs'

export default {
  name: 'BooksManager',
  methods: {
    delBook(id) {
      this.$store.commit('ui/setBusy', true)
      this.$store.dispatch('books/remove', id).then(() => {
        this.$store.commit('ui/setBusy', false)
      })
    },
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
  }
}

</script>

<template>

  <div class="m-20 is-flex is-justify-content-center">
    <div class="is-flex-grow-1 mx-20" style="max-width: 900px;">

      <div class="mb-5">
        <router-link :to="{ name: 'Dashboard' }" class="is-uppercase is-primary">&lt; Back to Dashboard</router-link>
      </div>

      <h1 class="title divider-bottom mb-30">Books Manager</h1>

      <div class="mb-30">
        <router-link class="button is-rounded is-primary" :to="{name:'BookManagerAddForm'}">Add Book</router-link>
      </div>

      <table class="table w-100">
        <thead>
          <tr>
            <th>ISBN</th>
            <th>Title</th>
            <th>Author(s)</th>
            <th>Illustrator(s)</th>
            <th class="has-text-right">Created</th>
            <th class="has-text-right">Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book of $store.getters['books/list']()" :key="book.id">

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

.table td {
  vertical-align: middle;
}
</style>
