<script>

import BookField from '@/components/BookField'
import UserField from '@/components/UserField'

export default {
  components: {
    'field-book': BookField,
    'field-user': UserField
  },
  data() {
    return {
      mode: 'new',
      bundle: {
        id: null,
        books: {},
        created: '',
        curator: '',
        description: '',
        name: '',
        reviewedAt: '',
        reviewedBy: '',
        status: 'pending',
        updated: '',
      }
    }
  },
  computed: {
    hasBooks() {
      return Object.keys(this.bundle.books).length > 0
    },
    booksIDs() {
      return Object.keys(this.bundle.books)
    }
  },
  created() {
    if (this.$router.currentRoute._value.name === 'BundleManagerUpdateForm') {
      const b = this.$store.state.bundlesIndex[this.$route.params.uid] || null
      if (b) {
        this.bundle = b
        this.mode = 'update'
      }
    }
  },
  methods: {
    save() {
      this.$store.dispatch('saveBundle', this.bundle).then(() => {
        this.$router.push({ name: 'BundlesManager' })
      })
    },
    addBook() {
      this.bundle.books[''] = true
    },
    delBook(bid) {

    }
  }
}
</script>

<template>
  <h1 v-if="mode==='new'" class="title page-title">Add Bundle</h1>
  <h1 v-if="mode!=='new'" class="title page-title">Update Bundle</h1>

  <section class="section">
    <form @submit.prevent="save()">
      <div class="columns">
        <div class="column">

          <div class="field">
            <label class="label">Name</label>
            <div class="control">
              <input v-model="bundle.name" type="text" class="input">
            </div>
          </div>

          <div class="field">
            <label class="label">Description</label>
            <div class="control">
              <textarea v-model="bundle.description" class="textarea" />
            </div>
          </div>

          <div class="field">
            <label class="label">Curator</label>
            <div class="control">
              <field-user :userID="bundle.curator" @changed="bundle.curator = $event" />
            </div>
          </div>

          <div class="field">
            <label class="label d-inline">Books</label>
            <button class="button is-primary is-small d-inline ml-5" @click.prevent="addBook()">
              <i class="fas fa-plus mr-2" />
              <span>Add</span>
            </button>
            <field-book v-for="bid of booksIDs" :key="bid" :bookID="bid" />
          </div>

        </div>
      </div>
      <div class="">
        <input type="submit" class="button is-primary" value="Save">
        <router-link class="button is-secondary ml-3" :to="{name: 'BundlesManager'}">Cancel</router-link>
      </div>
    </form>
  </section>

</template>

<style scoped lang="scss">
.d-inline {
  display: inline !important;
}
</style>
