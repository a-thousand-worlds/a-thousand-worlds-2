<script>

export default {
  name: 'PeopleManagerListPage',
  methods: {
    delPerson(id) {
      this.$store.dispatch('delPerson', id).then(() => {
        // this.addTagTag = ''
      })
    }
  }
}

</script>

<template>

  <h1 class="title page-title level-item">People Manager</h1>

  <div class="level">
    <div class="level-right">
      <div class="level-item">
        <router-link class="button is-primary" :to="{name:'PeopleManagerAddForm'}">Add Person</router-link>
      </div>
    </div>
  </div>

  <section class="section">
    <table class="table w-100">
      <thead>
        <tr>
          <th>Account</th>
          <th>Name</th>
          <th>Role</th>
          <th>Created/Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="person of $store.state.peopleList" :key="person.id">
          <td>{{ person.id }}</td>
          <td>
            <span>{{ person.name }}</span>
          </td>
          <td>{{ person.role }}</td>
          <td>{{ $dateFormat(person.created) }}/{{ $dateFormat(person.updated) }}</td>
          <td class="actions">
            <div class="field is-grouped is-justify-content-flex-end">
              <p class="control"><router-link :to="{name:'PersonManagerUpdateForm',params:{uid:person.id}}" class="button is-secondary">
                <i class="fas fa-pencil-alt mr-2" />
                <span>Edit</span>
              </router-link></p>
              <p class="control"><button class="button is-danger" @click.prevent="delPerson(person.id)">
                <i class="fas fa-trash mr-2" />
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
