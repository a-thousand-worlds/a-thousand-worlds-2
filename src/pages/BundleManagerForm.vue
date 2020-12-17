<script>

import BookField from '@/components/BookField'
import UserField from '@/components/UserField'

export default {
  data() {
    return {
      mode: 'new',
      bundle: {
        id: null,
        curator: '',
        name: '',
        description: '',
        books: {},
        created: '',
        updated: '',
        approved: false,
        approvedBy: '',
        approvedAt: '',
      }
    }
  },
  created() {
    if (this.$router.currentRoute._value.name === 'BundleManagerUpdateForm') {
      const b = this.$store.state.bundlesIndex[this.$router.currentRoute._value.params.uid] || null
      if (b) {
        this.bundle = b
        this.mode = 'update'
      }
    }
    window.scrollTo(0, 0)
  },
  methods: {
    save() {
      this.$store.dispatch('saveBundle', this.bundle).then(() => {
        // eslint-disable-next-line fp/no-mutating-methods
        this.$router.push({ name: 'BundlesManager' })
      })
    },
    addBook() {
      this.bundle.books[''] = true
    },
    delBook(bid) {

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
  components: {
    'field-book': BookField,
    'field-user': UserField
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
            <input type="text" class="input" v-model="bundle.name">
          </div>
        </div>

        <div class="field">
          <label class="label">Description</label>
          <div class="control">
            <textarea class="textarea" v-model="bundle.description"></textarea>
          </div>
        </div>

        <div class="field">
          <label class="label">Curator</label>
          <div class="control">
            <field-user :userID="bundle.curator" @changed="bundle.curator = $event"></field-user>
          </div>
        </div>

        <div class="field">
          <label class="label d-inline">Books</label>
          <button @click.prevent="addBook()" class="button is-primary is-small d-inline ml-5">
            <i class="fas fa-plus mr-2"></i>
            <span>Add</span>
          </button>
          <field-book v-for="bid of booksIDs" :key="bid" :bookID="bid"></field-book>
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
