<script>

export default {
  name: 'TagsManagerPage',
  data() {
    return {
      addTagTag: {
        tag: '',
        sortOrder: 0,
        showOnFront: false
      },
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
    updateTag(tagid) {
      this.$store.dispatch('updateTag', { ...this.edits[tagid] }).then(() => {
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
        <th>Sort</th>
        <th>Show on Front</th>
        <th>Tag</th>
        <th>Created/Updated</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="tag of $store.state.sortedTags" :key="tag.id">
        <td>
          <span v-if="!edits[tag.id]">
            <span class="ml-2">{{tag.sortOrder}}</span>
          </span>
          <span v-if="edits[tag.id]">
            <input type="text" class="input" v-model="edits[tag.id].sortOrder"/>
          </span>
        </td>
        <td>
          <span v-if="!edits[tag.id]">
            <i v-if="tag.showOnFront" class="fas fa-check has-text-primary"></i>
            <i v-if="!tag.showOnFront" class="fas fa-minus has-text-secondary"></i>
          </span>
          <span v-if="edits[tag.id]"><input type="checkbox" class="checkbox" v-model="edits[tag.id].showOnFront"/></span>
        </td>
        <td>
          <span v-if="!edits[tag.id]">{{tag.tag}}</span>
          <span v-if="edits[tag.id]"><input type="text" class="input" v-model="edits[tag.id].tag"/></span>
        </td>
        <td>{{ $dateFormat(tag.created) }}/{{ $dateFormat(tag.updated) }}</td>
        <td class="actions">
          <div v-if="!edits[tag.id]" class="field is-grouped is-justify-content-flex-end">
            <p class="control"><button @click.prevent="toggleEditTag(tag.id, tag)" class="button is-secondary">
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
            <p class="control"><button @click.prevent="updateTag(tag.id)" class="button is-primary">
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
        <input type="text" class="input" placeholder="Enter tag" v-model="addTagTag.tag"/>
      </p>
      <p class="control">
        <a class="button is-static">Sort Order</a>
      </p>
      <p class="control">
        <input type="text" class="input" placeholder="Sort order" v-model="addTagTag.sortOrder"/>
      </p>
      <p class="control">
        <a class="button" @click.prevent="addTagTag.showOnFront=!addTagTag.showOnFront">
          Show on Front
          <input type="checkbox" class="checkbox ml-2" placeholder="Sort order" v-model="addTagTag.showOnFront"/>
        </a>
      </p>
      <p class="control">
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
