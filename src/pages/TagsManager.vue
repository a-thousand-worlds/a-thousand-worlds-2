<script>

export default {
  name: 'TagsManagerPage',
  data() {
    return {
      addTagTag: '',
      edits: {}
    }
  },
  methods: {
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
  }
}

</script>

<template>

<h1 class="title page-title level-item">Tags Manager</h1>

<section class="section">
  <table class="table w-100">
    <thead>
      <tr>
        <th>ID</th>
        <th>Tag</th>
        <th>Created/Updated</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="tag of $store.state.tags" :key="tag.id">
        <td>{{tag.id}}</td>
        <td>
          <span v-if="!edits[tag.id]">{{tag.tag}}</span>
          <span v-if="edits[tag.id]"><input type="text" class="input" v-model="edits[tag.id]"/></span>
        </td>
        <td>{{tag.created}}/{{tag.updated}}</td>
        <td class="actions">
          <div v-if="!edits[tag.id]" class="field is-grouped is-justify-content-flex-end">
            <p class="control"><button @click.prevent="toggleEditTag(tag.id, tag.tag)" class="button is-secondary">
              <i class="fas fa-pencil-alt mr-2"></i>
              <span>Edit</span>
            </button></p>
            <p class="control"><button @click.prevent="delTag(tag.id)" class="button is-danger">
              <i class="fas fa-trash mr-2"></i>
              <span>Delete</span>
            </button></p>
          </div>
          <div v-if="edits[tag.id]" class="field is-grouped is-justify-content-flex-end">
            <p class="control"><button @click.prevent="toggleEditTag(tag.id, null)" class="button is-secondary">
              <i class="fas fa-times mr-2"></i>
              <span>Cancel</span>
            </button></p>
            <p class="control"><button @click.prevent="updateTag(tag.id,edits[tag.id])" class="button is-primary">
              <i class="fas fa-check mr-2"></i>
              <span>Save</span>
            </button></p>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</section>
<section class="section">
  <form class="w-100" @submit.prevent="addTag()">
    <div class="field has-addons">
      <p class="control">
        <a class="button is-static">Add Tag</a>
      </p>
      <p class="control w-100">
        <input type="text" class="input" placeholder="Enter tag" v-model="addTagTag"/>
      </p>
      <p class="control">
        <button type="submit" class="button is-primary">
          <i class="fas fa-plus mr-2"></i>
          <span>Add</span>
        </button>
      </p>
    </div>
  </form>
</section>

</template>

<style scoped lang="scss">
th:last-child {
  text-align: right;
}
</style>
