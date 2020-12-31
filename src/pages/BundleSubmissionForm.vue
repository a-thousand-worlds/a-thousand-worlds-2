<script>

import BookTitleField from '@/components/fields/BookTitle'
import BookIsbnField from '@/components/fields/BookIsbn'
import PersonField from '@/components/fields/Person'

export default {
  components: {
    'book-title-field': BookTitleField,
    'book-isbn-field': BookIsbnField,
    'person-field': PersonField
  },
  data() {
    return {
      name: '',
      description: '',
      books: []
    }
  },
  computed: {
    draftable() {
      return this.books
        .map(x => x.title || x.author || x.illustrator || x.isbn)
        .reduce((acc, x) => x || acc, false)
        || this.name.length
        || this.description.length
    },
    submitable() {
      return this.books
        .map(x => x.title.length && x.author.length)
        .reduce((acc, x) => x && acc, true)
        && this.name.length
        && this.description.length
    }
  },
  created() {
    this.addBook()
  },
  methods: {
    saveDraft() {
      const data = {
        name: this.name || '',
        description: this.description || '',
        books: this.books
      }
      this.$store.dispatch('saveBundleSubmissionsDraft', data)
        .then(() => {
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push({ name: 'Dashboard' })
        })
    },
    submitForReview() {
      const data = {
        name: this.name || '',
        description: this.description || '',
        books: this.books
      }
      this.$store.dispatch('submitBundleSubmission', data)
        .then(() => {
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push({ name: 'Dashboard' })
        })
    },
    newBookObject() {
      return {
        title: '',
        isbn: '',
        author: '',
        illustrator: ''
      }
    },
    addBook() {
      // eslint-disable-next-line fp/no-mutating-methods
      this.books.push(this.newBookObject())
    },
    delBook(i) {
      this.books = this.books.filter((x, xi) => i !== xi)
    },
    fillBook(book, i) {
      this.books[i].title = book.title
      this.books[i].isbn = book.isbn
      this.books[i].author = this.$store.state.people.reduce((acc, x) => {
        if (book.authors.includes(x.name) && x.role === 'author') {
          if (acc !== '') {
            acc += ', '
          }
          acc += x.name
        }
        return acc
      }, '')
      this.books[i].illustrator = this.$store.state.people.reduce((acc, x) => {
        if (book.authors.includes(x.name) && x.role === 'illustrator') {
          if (acc !== '') {
            acc += ', '
          }
          acc += x.name
        }
        return acc
      }, '')
    }
  }
}

</script>

<template>
  <h1 class="title page-title">Curate a Book Bundle</h1>

  <section class="section">

    <div class="field">
      <label class="label">What do you want to call this bundle?</label>
      <div class="control">
        <input v-model="name" :disabled="$uiBusy" type="text" class="input">
      </div>
    </div>

    <div class="field">
      <label class="label">Tell us why you love these books. (this will serve as the description for the Bundle)</label>
      <div class="control">
        <textarea v-model="description" class="textarea" />
      </div>
    </div>

    <hr>
  </section>
  <div v-for="(book, i) of books" :key="i">
    <section class="section">

      <div class="field">
        <label class="label">Title</label>
        <book-title-field v-model="books[i].title" :disabled="$uiBusy" @book-selected="fillBook($event, i)" />
      </div>

      <div class="field">
        <label class="label">Author</label>
        <person-field v-model="books[i].author" :disabled="$uiBusy" :role="'author'" />
      </div>

      <div class="field">
        <label class="label">Illustrator</label>
        <person-field v-model="books[i].illustrator" :disabled="$uiBusy" :role="'illustrator'" />
      </div>

      <div class="field">
        <label class="label">ISBN</label>
        <book-isbn-field
          v-model="books[i].isbn"
          :disabled="$uiBusy"
          :searchable="false"
          @book-selected="fillBook($event, i)"
        />
      </div>

    </section>

    <section v-if="books.length>1">
      <button class="button is-info is-outlined" @click="delBook(i)">
        <i class="fas fa-minus" />
        <span class="ml-3">Delete</span>
      </button>
    </section>

  </div>

  <section class="section">
    <div>
      <button :disabled="$uiBusy" class="button is-primary" @click.prevent="addBook()">
        <i class="fas fa-plus" />
        <span class="ml-2">Add another book</span>
      </button>
    </div>
  </section>

  <section class="section">
    <div class="field is-grouped">
      <div class="control">
        <button :disabled="!draftable||$uiBusy" :class="{'is-loading':$uiBusy}" class="button is-primary" @click.prevent="saveDraft()">
          <span class="ml-2">Save as draft</span>
        </button>
      </div>
      <div class="control">
        <button :disabled="!submitable||$uiBusy" :class="{'is-loading':$uiBusy}" class="button is-primary" @click.prevent="submitForReview()">
          <span class="ml-2">Submit for review</span>
        </button>
      </div>
    </div>
  </section>

</template>
