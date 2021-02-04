<script>
import { v4 as uid } from 'uuid'
import specialFilters from '@/store/constants/special-filters'

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
    specialFilters() {
      return specialFilters[this.type]
    },
    tags() {
      return this.$store.getters[`tags/${this.type}/listSorted`]()
    },
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
      const id = uid()
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

    async toggleShowOnContributorSignup(id) {
      const tag = this.$store.state.tags[this.type].data[id]
      tag.showOnContributorSignup = !tag.showOnContributorSignup || null
      await this.$store.dispatch(`tags/${this.type}/save`, {
        path: `${id}/showOnContributorSignup`,
        value: tag.showOnContributorSignup
      })
    },

    async toggleShowOnFront(id) {
      const tag = this.$store.state.tags[this.type].data[id]
      tag.showOnFront = !tag.showOnFront || null
      await this.$store.dispatch(`tags/${this.type}/save`, {
        path: `${id}/showOnFront`,
        value: tag.showOnFront
      })
    },

    async updateTag(tagid) {
      const tag = { ...this.edits[tagid] }
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch(`tags/${this.type}/save`, { path: tagid, value: tag })
      this.edits[tagid] = null
      this.$store.commit('ui/setBusy', false)
    },

  },
}

</script>

<template>

  <table class="table w-100">
    <thead>
      <tr>
        <th style="width: 100%;">Tag</th>
        <th class="has-text-right" v-tippy="{ content: `Set the sort order of the tags in the filter menu. Tags with lower numbers show up above tags with higher numbers.` }" style="white-space: nowrap;">Sort <i class="far fa-question-circle" /></th>
        <th class="has-text-centered" v-tippy="{ content: `Adjust the likelihood of ${type} being sorted to the top. For example, a person that has a tag with weight 10 means the person is 10 times more likely to be sorted to the top than a person that has a tag with weight 1` }" style="white-space: nowrap;">Weight <i class="far fa-question-circle" /></th>
        <th v-if="type === 'people'" class="has-text-centered" v-tippy="{ content: `Show this tag as one of the identity options when contributors sign up.` }" style="white-space: nowrap;">Contributor <i class="far fa-question-circle" /></th>
        <th class="has-text-centered" v-tippy="{ content: `Show this tag in the ${type} filter menu` }" style="white-space: nowrap;">Show <i class="far fa-question-circle" /></th>
        <th>Edit/Delete</th>
      </tr>
    </thead>
    <tbody>

      <!-- special filters -->
      <tr v-for="filter of specialFilters" :key="filter.id">
        <td>
          <div class="field">
            <div class="control" style="opacity: 0.5;">{{ filter.tag }}</div>
          </div>
        </td>
        <td />
        <td />
        <td />
        <td v-if="type === 'people'" />
        <td />
      </tr>

      <!-- filters -->
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

        <!-- sort -->
        <td class="has-text-right">
          <span v-if="!edits[tag.id]">
            <span class="ml-2">{{ tag.sortOrder }}</span>
          </span>
          <span v-if="edits[tag.id]">
            <input v-model.number="edits[tag.id].sortOrder" type="number" class="input" style="min-width: 50px; padding-right: calc(0.75rem - 8px);">
          </span>
        </td>

        <!-- weight -->
        <td class="has-text-right">
          <span v-if="!edits[tag.id]">
            <span class="ml-2">{{ tag.weight }}</span>
          </span>
          <span v-if="edits[tag.id]">
            <input v-model.number="edits[tag.id].weight" type="number" class="input" style="min-width: 50px;padding-right: calc(0.75rem - 8px);" required>
          </span>
        </td>

        <!-- contributor -->
        <td v-if="type === 'people'" class="has-text-centered">
          <a @click.prevent="toggleShowOnContributorSignup(tag.id)">
            <i v-if="tag.showOnContributorSignup" class="fas fa-check has-text-primary" />
            <i v-else class="fas fa-minus has-text-secondary" />
          </a>
        </td>

        <!-- show in book filters -->
        <td class="has-text-centered">
          <a v-if="!edits[tag.id]" @click.prevent="toggleShowOnFront(tag.id)">
            <i v-if="tag.showOnFront" class="fas fa-check has-text-primary" />
            <i v-else class="fas fa-minus has-text-secondary" />
          </a>
          <span v-if="edits[tag.id]"><input v-model="edits[tag.id].showOnFront" type="checkbox" class="checkbox"></span>
        </td>

        <!-- edit/delete -->
        <td>
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

  <form class="w-100" @submit.prevent="addTag">
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
        <input v-model.number="newTag.sortOrder" :disabled="$uiBusy" type="text" class="input" placeholder="1" style="min-width: 60px">
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

<style lang="scss" scoped>
table th:last-child {
  text-align: right;
}
table td {
  vertical-align: middle;
}
</style>
