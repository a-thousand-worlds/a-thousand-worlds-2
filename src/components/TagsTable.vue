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
  computed: {
    tags() {
      return this.$store.getters[`tags/${this.type}/listSorted`]()
    }
  },
  watch: {
    type(next) {
      this.resetNewTag()
    }
  },
  created() {
    this.resetNewTag()
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
}

</script>

<template>

  <table class="table w-100">
    <thead>
      <tr>
        <th style="width: 100%;">Tag</th>
        <th class="has-text-right" style="white-space: nowrap;">Sort Order</th>
        <th class="has-text-centered" title="Show this tag in the book filters" style="white-space: nowrap;">Show <i class="far fa-question-circle" /></th>
        <th>Edit/Delete</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="tag of tags" :key="tag.id">

        <!-- tag -->
        <td>
          <div class="field">
            <div class="control">
              <span v-if="edits[tag.id]"><input v-model="edits[tag.id].tag" type="text" class="input"></span>
              <span v-else>{{ tag.tag }}</span>
            </div>
          </div>
        </td>

        <!-- sort order -->
        <td class="has-text-right">
          <span v-if="!edits[tag.id]">
            <span class="ml-2">{{ tag.sortOrder }}</span>
          </span>
          <span v-if="edits[tag.id]">
            <input v-model="edits[tag.id].sortOrder" type="text" class="input">
          </span>
        </td>

        <!-- show in book filters -->
        <td class="has-text-centered">
          <span v-if="!edits[tag.id]">
            <i v-if="tag.showOnFront" class="fas fa-check has-text-primary" />
            <i v-else class="fas fa-minus has-text-secondary" />
          </span>
          <span v-if="edits[tag.id]"><input v-model="edits[tag.id].showOnFront" type="checkbox" class="checkbox"></span>
        </td>

        <!-- edit/delete -->
        <td class="actions">
          <div v-if="!edits[tag.id]" class="field is-grouped is-justify-content-flex-end">
            <p class="control"><button :disabled="$uiBusy" class="button is-flat" @click.prevent="toggleEditTag(tag.id, tag)">
                                 <i class="fas fa-pencil-alt" />
                               </button>
              <button :disabled="$uiBusy" class="button is-flat" @click.prevent="remove(tag.id)">
                <i class="fas fa-times" />
              </button></p>
          </div>
          <div v-if="edits[tag.id]" class="field is-grouped is-justify-content-flex-end">
            <p class="control"><button :disabled="$uiBusy" class="button is-rounded" @click.prevent="toggleEditTag(tag.id, null)">
              <span>Cancel</span>
            </button></p>
            <p class="control"><button :disabled="$uiBusy" class="button is-rounded is-primary" @click.prevent="updateTag(tag.id)">
              <i class="fas fa-check mr-2" />
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
        <input v-model="newTag.tag" type="text" :disabled="$uiBusy" class="input" placeholder="Enter tag">
      </p>
      <p class="control">
        <a class="button is-static">Sort Order</a>
      </p>
      <p class="control">
        <input v-model="newTag.sortOrder" :disabled="$uiBusy" type="number" class="input" placeholder="Sort order">
      </p>
      <p class="control">
        <a class="button" @click.prevent="newTag.showOnFront = !newTag.showOnFront">
          Show <input v-model="newTag.showOnFront" :disabled="$uiBusy" type="checkbox" class="checkbox ml-2">
        </a>
      </p>
      <p class="control" />
      <p class="control">
        <button :disabled="$uiBusy" type="submit" class="button is-primary">
          <i class="fas fa-plus mr-2" />
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
