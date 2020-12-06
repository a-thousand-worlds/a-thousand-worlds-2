<script>

export default {
  name: 'BooksManagerListPage',
  methods: {
    delBook(id) {
      this.$store.dispatch('delBook', id).then(() => {
      })
    }
  }
}

</script>

<template>

<h1 class="title page-title level-item">Books Manager</h1>

<div class="level">
  <div class="level-right">
    <div class="level-item">
      <router-link class="button is-primary" :to="{name:'BookManagerAddForm'}">Add Book</router-link>
    </div>
  </div>
</div>

<section class="section">
  <table class="table w-100">
    <thead>
      <tr>
        <th>ID</th>
        <th>ISBN</th>
        <th>Title</th>
        <th>Created/Updated</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="book of $store.state.booksList" :key="book.id">
        <td>{{book.id}}</td>
        <td>
          <span>{{book.isbn}}</span>
        </td>
        <td>
          <span>{{book.title}}</span>
        </td>
        <td>{{ $dateFormat(book.created) }}/{{ $dateFormat(book.updated) }}</td>
        <td class="actions">
          <div class="field is-grouped is-justify-content-flex-end">
            <p class="control"><router-link :to="{name:'BookManagerUpdateForm',params:{bid:book.id}}" class="button is-secondary">
              <i class="fas fa-pencil-alt mr-2"></i>
              <span>Edit</span>
            </router-link></p>
            <p class="control"><button @click.prevent="delBook(book.id)" class="button is-danger">
              <i class="fas fa-trash mr-2"></i>
              <span>Delete</span>
            </button></p>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</section>

</template>

<style scoped lang="scss">
th:last-child {
  text-align: right;
}
</style>
