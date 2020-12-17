<script>

import BookTitleField from '@/components/fields/BookTitle'
import BookIsbnField from '@/components/fields/BookIsbn'
import PersonField from '@/components/fields/Person'

export default {
  data() {
    return {
      name: '',
      description: '',
      books: []
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
      this.$store.dispatch('saveBundleSubmissionDraft', data)
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
      this.$store.dispatch('submitBundleSuggestion', data)
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
  components: {
    'book-title-field': BookTitleField,
    'book-isbn-field': BookIsbnField,
    'person-field': PersonField
  }
}

</script>

<template>
<h1 class="title page-title">Curate a Book Bundle</h1>

<section class="section">

  <div class="field">
    <label class="label">What do you want to call this bundle?</label>
    <div class="control">
      <input :disabled="$uiBusy" type="text" class="input" v-model="name">
    </div>
  </div>

  <div class="field">
    <label class="label">Tell us why you love these books. (this will serve as the description for the Bundle)</label>
    <div class="control">
      <textarea class="textarea" v-model="description"></textarea>
    </div>
  </div>

  <hr/>
</section>
<div v-for="(book, i) of books" :key="i">
  <section class="section">

    <div class="field">
      <label class="label">Title</label>
      <book-title-field :disabled="$uiBusy" v-model="books[i].title" @book-selected="fillBook($event, i)"/>
    </div>

    <div class="field">
      <label class="label">Author</label>
      <person-field :disabled="$uiBusy" v-model="books[i].author" :role="'author'"/>
    </div>

    <div class="field">
      <label class="label">Illustrator</label>
      <person-field :disabled="$uiBusy" v-model="books[i].illustrator" :role="'illustrator'"/>
    </div>

    <div class="field">
      <label class="label">ISBN</label>
      <book-isbn-field
        :disabled="$uiBusy"
        :searchable="false"
        v-model="books[i].isbn"
        @book-selected="fillBook($event, i)"
      />
    </div>

  </section>

  <section v-if="books.length>1">
    <button @click="delBook(i)" class="button is-info is-outlined">
      <i class="fas fa-minus"></i>
      <span class="ml-3">Delete</span>
    </button>
  </section>

</div>

<section class="section">
  <div>
    <button :disabled="$uiBusy" @click.prevent="addBook()" class="button is-primary">
      <i class="fas fa-plus"></i>
      <span class="ml-2">Add another book</span>
    </button>
  </div>
</section>

<section class="section">
  <div class="field is-grouped">
    <div class="control">
      <button :disabled="!draftable||$uiBusy" :class="{'is-loading':$uiBusy}" @click.prevent="saveDraft()" class="button is-primary">
        <span class="ml-2">Save as draft</span>
      </button>
    </div>
    <div class="control">
      <button :disabled="!submitable||$uiBusy" :class="{'is-loading':$uiBusy}" @click.prevent="submitForReview()" class="button is-primary">
        <span class="ml-2">Submit for review</span>
      </button>
    </div>
  </div>
</section>

</template>
