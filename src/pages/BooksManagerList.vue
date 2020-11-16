<script>

export default {
  name: 'BooksManagerListPage',
  data() {
    return {
      addTagTag: '',
      edits: {}
    }
  },
  methods: {
    /*
    addTag() {
      this.$store.dispatch('addTag', this.addTagTag).then(() => {
        this.addTagTag = ''
      })
    },
    delTag(id) {
      this.$store.dispatch('delTag', id).then(() => {
        this.addTagTag = ''
      })
    },
    toggleEditTag(id, state) {
      this.edits[id] = state
    },
    updateTag(tagid, tag) {
      this.$store.dispatch('updateTag', { tagid, tag }).then(() => {
        this.edits[tagid] = null
      })
    }
    */
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
        <th>Book/ISBN</th>
        <th>Created/Updated</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="book of $store.state.books" :key="book.id">
        <td>{{book.id}}</td>
        <td>
          <span>{{book.title}}</span>
        </td>
        <td>{{book.created}}/{{book.updated}}</td>
        <td class="actions">
          <div class="field is-grouped is-justify-content-flex-end">
            <p class="control"><button @click.prevent="" class="button is-secondary">
              <i class="fas fa-pencil-alt mr-2"></i>
              <span>Edit</span>
            </button></p>
            <p class="control"><button @click.prevent="" class="button is-danger">
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
