<script>
import { v4 } from 'uuid'

export default {
  name: 'TagsTable',
  props: {
    type: {
      type: String,
      default: 'books',
      required: true,
    },
  },
  data() {
    return {
      edits: {},
      newTag: {},
    }
  },
  created() {
    this.resetNewTag()
  },
  computed: {
    tags() {
      return this.$store.getters[`tags/${this.type}/listSorted`]()
    }
  },
  methods: {
    async addTag() {
      const id = v4()
      await this.$store.dispatch(`tags/${this.type}/save`, { path: id, value: { id, ...this.newTag } })
      this.resetNewTag()
    },
    async remove(id) {
      await this.$store.dispatch(`tags/${this.type}/remove`, id)
      this.resetNewTag()
    },
    resetNewTag() {
      this.newTag = {
        tag: '',
        showOnFront: true,
        sortOrder: this.tags.length > 0
          ? (this.tags[this.tags.length - 1].sortOrder || 0) + 1
          : 1,
      }
    },
    toggleEditTag(id, state) {
      this.edits[id] = state
    },
    async updateTag(tagid) {
      const tag = { ...this.edits[tagid] }
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch(`tags/${this.type}/save`, { path: tagid, value: tag })
      this.edits[tagid] = null
      this.$store.commit('ui/setBusy', false)
    }
  },
  watch: {
    type(next) {
      this.resetNewTag()
    }
  },
}

</script>

<template>

  <table class="table w-100">
    <thead>
      <tr>
        <th style="width: 100%;">Tag</th>
        <th class="has-text-right" style="white-space: nowrap;">Sort Order</th>
        <th class="has-text-centered" title="Show this tag in the book filters" style="white-space: nowrap;">Show <i class="far fa-question-circle"></i></th>
        <th>Edit/Delete</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="tag of tags" :key="tag.id">

        <!-- tag -->
        <td>
          <div class="field">
            <div class="control">
              <span v-if="edits[tag.id]"><input type="text" class="input" v-model="edits[tag.id].tag"/></span>
              <span v-else>{{tag.tag}}</span>
            </div>
          </div>
        </td>

        <!-- sort order -->
        <td class="has-text-right">
          <span v-if="!edits[tag.id]">
            <span class="ml-2">{{tag.sortOrder}}</span>
          </span>
          <span v-if="edits[tag.id]">
            <input type="text" class="input" v-model="edits[tag.id].sortOrder"/>
          </span>
        </td>

        <!-- show in book filters -->
        <td class="has-text-centered">
          <span v-if="!edits[tag.id]">
            <i v-if="tag.showOnFront" class="fas fa-check has-text-primary"></i>
            <i v-else class="fas fa-minus has-text-secondary"></i>
          </span>
          <span v-if="edits[tag.id]"><input type="checkbox" class="checkbox" v-model="edits[tag.id].showOnFront"/></span>
        </td>

        <!-- edit/delete -->
        <td class="actions">
          <div v-if="!edits[tag.id]" class="field is-grouped is-justify-content-flex-end">
            <p class="control"><button @click.prevent="toggleEditTag(tag.id, tag)" :disabled="$uiBusy" class="button is-flat">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button @click.prevent="remove(tag.id)" :disabled="$uiBusy" class="button is-flat">
              <i class="fas fa-times"></i>
            </button></p>
          </div>
          <div v-if="edits[tag.id]" class="field is-grouped is-justify-content-flex-end">
            <p class="control"><button @click.prevent="toggleEditTag(tag.id, null)" :disabled="$uiBusy" class="button is-rounded">
              <span>Cancel</span>
            </button></p>
            <p class="control"><button @click.prevent="updateTag(tag.id)" :disabled="$uiBusy" class="button is-rounded is-primary">
              <i class="fas fa-check mr-2"></i>
              <span>Save</span>
            </button></p>
          </div>
        </td>

      </tr>
    </tbody>
  </table>

  <form class="w-100" @submit.prevent="addTag()">
    <div class="field has-addons">
      <p class="control">
        <a class="button is-static">Add Tag</a>
      </p>
      <p class="control w-100">
        <input type="text" :disabled="$uiBusy" class="input" placeholder="Enter tag" v-model="newTag.tag"/>
      </p>
      <p class="control">
        <a class="button is-static">Sort Order</a>
      </p>
      <p class="control">
        <input :disabled="$uiBusy" type="number" class="input" placeholder="Sort order" v-model="newTag.sortOrder"/>
      </p>
      <p class="control">
        <a class="button" @click.prevent="newTag.showOnFront = !newTag.showOnFront">
          Show <input :disabled="$uiBusy" type="checkbox" class="checkbox ml-2" v-model="newTag.showOnFront"/>
        </a>
      </p>
      <p class="control">
      </p>
      <p class="control">
        <button :disabled="$uiBusy" type="submit" class="button is-primary">
          <i class="fas fa-plus mr-2"></i>
          <span>Add</span>
        </button>
      </p>
    </div>
  </form>

</template>

<style scoped lang="scss">
th:last-child {
  text-align: right;
}
td {
  vertical-align: middle;
}
</style>
