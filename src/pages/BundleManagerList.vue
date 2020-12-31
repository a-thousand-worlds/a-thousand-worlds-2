<script>

export default {
  name: 'BundleManagerListPage',
  methods: {
    delBundle(id) {
      this.$store.dispatch('delBundle', id).then(() => {
      })
    }
  }
}

</script>

<template>

  <h1 class="title page-title level-item">Bundles Manager</h1>

  <div class="level">
    <div class="level-right">
      <div class="level-item">
        <router-link class="button is-primary" :to="{name:'BundleManagerNewForm'}">Add Bundle</router-link>
      </div>
    </div>
  </div>

  <section class="section">
    <table class="table w-100">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Curator</th>
          <th>Created/Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bundle of $store.state.bundles" :key="bundle.id">
          <td>{{ bundle.id }}</td>
          <td>
            <span>{{ bundle.isbn }}</span>
          </td>
          <td>
            <span>{{ bundle.title }}</span>
          </td>
          <td>{{ $dateFormat(bundle.created) }}/{{ $dateFormat(bundle.updated) }}</td>
          <td class="actions">
            <div class="field is-grouped is-justify-content-flex-end">
              <p class="control"><router-link :to="{name:'BundleManagerUpdateForm',params:{bid:bundle.id}}" class="button is-secondary">
                <i class="fas fa-pencil-alt mr-2" />
                <span>Edit</span>
              </router-link></p>
              <p class="control"><button class="button is-danger" @click.prevent="delBundle(bundle.id)">
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
