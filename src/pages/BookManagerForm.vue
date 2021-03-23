<!-- DEPRECATED. Use Book Submission Form. -->
<script>

import coverImageByISBN from '@/util/coverImageByISBN'
import metadataByISBN from '@/util/metadataByISBN'
import PersonField from '@/components/PersonField'

export default {
  components: {
    'field-person': PersonField
  },
  data() {
    return {
      mode: 'new',
      searching: false,
      found: false,
      authorsRoles: [],
      book: {
        authors: [],
        cover: '',
        // file: null,
        goodreads: '',
        goodReads: null,
        google: null,
        isbn: '',
        openlib: null,
        publisher: '',
        summary: '',
        tags: {},
        title: '',
        year: 2020,
      }
    }
  },
  computed: {
    coverURL() {
      if (!this.book.cover) return ''
      return typeof this.book.cover === 'string' ? this.book.cover : this.book.cover.url || ''
    }
  },
  watch: {
    '$store.state.books.data'(next) {
      if (this.$router.currentRoute._value.name === 'BookManagerUpdateForm') {
        this.loadBookID(this.$route.params.bid)
      }
    }
  },
  created() {
    if (this.$router.currentRoute._value.name === 'BookManagerUpdateForm') {
      this.loadBookID(this.$route.params.bid)
    }
  },
  methods: {
    loadBookID(bid) {
      const b = this.$store.state.books.data?.[bid] || null
      if (b) {
        this.book = b
        if (!this.book.tags) {
          this.book.tags = {}
        }
        if (!this.book.authors) {
          this.book.authors = []
        }
        else {
          this.book.tags = this.book.tags.reduce((tags, x) => {
            const tag = this.$store.state.sortedTags.reduce((acc, t) => t.tag === x ? t : acc, null)
            if (tag) {
              tags[tag.id] = true
            }
            return tags
          }, {})
        }
        this.mode = 'update'
      }
    },
    searchISBN() {
      this.searching = true
      metadataByISBN(this.book.isbn).then(res => {
        this.searching = false
        if (!res) {
          return
        }
        this.book = res
        coverImageByISBN(this.book.isbn).then(cover => {
          this.book.cover = cover
        })
      })
    },
    save() {
      this.$store.dispatch('saveBook', { book: this.book, roles: this.authorsRoles }).then(() => {
        this.$router.push({ name: 'BooksManager' })
      })
    },
    reloadCover() {
      this.searching = true
      coverImageByISBN(this.book.isbn).then(res => {
        this.searching = false
        if (!res) {
          return
        }
        this.book.cover = res
      })
    },
    updatePerson(name, i) {
      this.book.authors[i] = name
    },
    updatePersonRole(role, i) {
      this.authorsRoles[i] = role
    },
    addAuthor() {
      // eslint-disable-next-line fp/no-mutating-methods
      this.book.authors.push('')
      // eslint-disable-next-line fp/no-mutating-methods
      this.authorsRoles.push('')
    },
    delAuthor() {
      // eslint-disable-next-line fp/no-mutating-methods
      this.book.authors.pop()
      // eslint-disable-next-line fp/no-mutating-methods
      this.authorsRoles.pop()
    },
    coverChange(e) {
      console.log('cover change', e)
    }
  }
}
</script>

<template>
  <h1 v-if="mode==='new'" class="title page-title">Add Book</h1>
  <h1 v-if="mode!=='new'" class="title page-title">Update Book</h1>

  <section class="section">
    <form class="w-100" @submit.prevent="searchISBN">
      <div class="field has-addons">
        <p class="control">
          <a v-if="mode==='new'" class="button is-static">Search by ISBN</a>
          <a v-if="mode!=='new'" class="button is-static">Update by ISBN</a>
        </p>
        <p class="control w-100">
          <input v-model="book.isbn" type="text" :disabled="searching" class="input" placeholder="Enter Book ISBN">
        </p>
        <p class="control">
          <button type="submit" :disabled="searching" class="button is-primary" :class="{'is-loading':searching}">
            <i class="fas fa-search mr-2" />
            <span v-if="mode==='new'">Search</span>
            <span v-if="mode!=='new'">Update</span>
          </button>
        </p>
      </div>
    </form>
  </section>

  <section class="section">
    <form class="w-100" @submit.prevent="save">
      <div class="columns">
        <div class="column is-one-third">
          <div>
            <img v-if="coverURL.length" :src="coverURL">
          </div>
          <div>
            <button class="button is-outlined" :disabled="$uiBusy || searching" :class="{'is-loading': searching}" @click.prevent="reloadCover">Reload</button>
          </div>
        </div>
        <div class="column is-two-thirds">

          <div class="field">
            <label class="label">Title</label>
            <div class="control">
              <input v-model="book.title" type="text" class="input">
            </div>
          </div>

          <div class="field">
            <label class="label">Summary</label>
            <div class="control">
              <textarea v-model="book.summary" class="textarea" />
            </div>
          </div>

          <div class="field">
            <label class="label d-inline">Authors</label>
            <button class="button is-primary is-small d-inline ml-5" @click.prevent="addAuthor">
              <i class="fas fa-plus mr-2" />
              <span>Add</span>
            </button>
            <button v-if="book.authors.length" class="button is-secondary is-small d-inline ml-5" @click.prevent="delAuthor">
              <i class="fas fa-minus mr-2" />
              <span>Remove</span>
            </button>
            <div v-for="(person, index) of book.authors" :key="index" class="mt-2 field is-grouped">
              <field-person :person="book.authors[index]" @changed="updatePerson($event,index)" @changed-role="updatePersonRole($event,index)" />
            </div>
          </div>

          <div class="field">
            <label class="label">Categories</label>
            <div v-for="tag of $store.state.sortedTags" :key="tag.id" class="control">
              <input :id="tag.id" v-model="book.tags[tag.id]" :name="tag.id" type="checkbox" class="checkbox mr-3">
              <label class="label d-inline" :for="tag.id">
                {{ tag.tag }} <i v-if="tag.showOnFront" class="fas fa-check has-text-primary ml-1" />
              </label>
            </div>
          </div>

          <div class="field">
            <label class="label">Book ID on Good Read</label>
            <div class="control">
              <input v-model="book.goodreads" type="text" class="input">
            </div>
          </div>

          <div class="field">
            <label class="label">Year</label>
            <div class="control">
              <input v-model="book.year" type="text" class="input">
            </div>
          </div>

          <div class="field">
            <label class="label">Publisher</label>
            <div class="control">
              <input v-model="book.publisher" type="text" class="input">
            </div>
          </div>

        </div>
      </div>
      <div>
        <input class="button is-primary" type="submit" value="Save">
        <router-link class="button is-secondary ml-2" :to="{name:'BooksManager'}">Cancel</router-link>
      </div>
    </form>
  </section>

</template>

<style scoped lang="scss">
#iff-isbn {
  width: 0px !important;
  height: 0px !important;
}
.d-inline {
  display: inline !important;
}
</style>
