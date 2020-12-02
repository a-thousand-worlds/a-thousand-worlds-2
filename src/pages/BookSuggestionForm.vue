<script>

import { isbnSearch } from '@/utils'
import AuthorWidget from '@/components/AuthorWidget'

export default {
  data() {
    return {
      books: [],
      submissions: [],
      titleSearches: [],
      authorSearches: [],
      illustratorSearches: [],
      isbnSearches: [],
      isbnGlobals: [],
    }
  },
  created() {
    if (Array.isArray(this.$store.state.user.profile.draftBooks) && this.$store.state.user.profile.draftBooks.length) {
      this.submissions = this.$store.state.user.profile.draftBooks.map(x => {
        if (!x.tags) {
          x.tags = {}
        }
        return x
      })
    }
    else {
      this.submissions = [this.newSubmissionObject()]
    }
    window.scrollTo(0, 0)
  },
  methods: {
    titleSearch($e, si) {
      const search = $e.target.value.toLowerCase()
      this.books[si] = null
      this.titleSearches[si] = []
      this.titleSearches[si] = Object.keys(this.$store.state.books)
        .map(x => this.$store.state.books[x])
        .filter(book => search.length && book.title.toLowerCase().includes(search))
    },
    authorSearch($e, si) {
      const search = $e.target.value.toLowerCase()
      this.authorSearches[si] = []
      this.authorSearches[si] = this.$store.state.people
        .filter(person => search.length && person.name.toLowerCase().includes(search) && person.role === 'author')
    },
    illustratorSearch($e, si) {
      const search = $e.target.value.toLowerCase()
      this.illustratorSearches[si] = []
      this.illustratorSearches[si] = this.$store.state.people
        .filter(person => search.length && person.name.toLowerCase().includes(search) && person.role === 'illustrator')
    },
    isbnSearch($e, si) {
      const search = $e.target.value.toString()
      this.books[si] = null
      this.isbnSearches[si] = []
      this.isbnSearches[si] = Object.keys(this.$store.state.books)
        .map(x => this.$store.state.books[x])
        .filter(book => search.length && book.isbn.toString().includes(search))
    },
    isbnGlobalSearch(si) {
      this.$store.commit('setBusy', true)
      this.isbnGlobals[si] = true
      this.clearSearches(si)
      const search = this.submissions[si].isbn.toString()
      isbnSearch(search)
        .then(res => {
          this.$store.commit('setBusy', false)
          this.isbnGlobals[si] = false
          if (!res) {
            console.log('nothing found')
            return
          }
          console.log('isbn global search res', res)
          const localBook = Object.keys(this.$store.state.books)
            .map(x => this.$store.state.books[x])
            .reduce((acc, book) => book.isbn === search ? book : acc, null)
          console.log('local book?', localBook)
          if (localBook) {
            this.books[si] = localBook
            return
          }
          this.books[si] = {
            cover: 'data:image/png;base64,' + res.cover
          }
          this.submissions[si].title = res.google ? res.google.title : res.openlib.title
          this.submissions[si].author = res.google ? res.google.authors.join(', ') : res.openlib.authors.join(', ')
          this.submissions[si].illustrator = ''
        })
        .catch(err => {
          this.$store.commit('setBusy', false)
          this.isbnGlobals[si] = false
          console.log('isbn global search err', err)
        })

    },
    fillBook(book, si) {
      console.log('fill book', book)
      if (book) {
        this.books[si] = book
        this.submissions[si].title = book.title
        this.submissions[si].isbn = book.isbn
        this.submissions[si].author = this.$store.state.people.reduce((acc, x) => {
          if (book.authors.includes(x.name) && x.role === 'author') {
            if (acc !== '') {
              acc += ', '
            }
            acc += x.name
          }
          return acc
        }, '')
        this.submissions[si].illustrator = this.$store.state.people.reduce((acc, x) => {
          if (book.authors.includes(x.name) && x.role === 'illustrator') {
            if (acc !== '') {
              acc += ', '
            }
            acc += x.name
          }
          return acc
        }, '')
      }
      this.titleSearches[si] = []
      this.isbnSearches[si] = []
      this.authorSearches[si] = []
      this.illustratorSearches[si] = []
    },
    fillAuthor(person, si) {
      if (person) {
        this.submissions[si].author = person.name
      }
      this.authorSearches[si] = []
    },
    fillIllustrator(person, si) {
      if (person) {
        this.submissions[si].illustrator = person.name
      }
      this.illustratorSearches[si] = []
    },
    setIsAuthor(si, state) {
      this.submissions[si].isAuthor = state
    },
    submitForReview() {
      /**/
      console.log('save', this.book, this.authorsRoles)
      this.$store.dispatch('submitBookSubmission', this.submissions).then(() => {
        console.log('book saved')
        // eslint-disable-next-line fp/no-mutating-methods
        this.$router.push({ name: 'Profile' })
      })
      /**/
    },
    saveDraft() {
      this.$store.dispatch('saveBookSubmissionsDraft', this.submissions)
        .then(() => {
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push({ name: 'Profile' })
        })
    },
    newSubmissionObject() {
      return {
        title: '',
        author: '',
        illustrator: '',
        isbn: '',
        isAuthor: null,
        tags: {},
        otherTag: ''
      }
    },
    addMoreSubmission() {
      // eslint-disable-next-line fp/no-mutating-methods
      this.submissions.push(this.newSubmissionObject())
    },
    delSubmission(si) {
      console.log('del sub', si)
      this.books = this.books.filter((x, xi) => xi !== si)
      this.submissions = this.submissions.filter((x, xi) => xi !== si)
      this.titleSearches = this.titleSearches.filter((x, xi) => xi !== si)
      this.authorSearches = this.authorSearches.filter((x, xi) => xi !== si)
      this.illustratorSearches = this.illustratorSearches.filter((x, xi) => xi !== si)
      this.isbnSearches = this.isbnSearches.filter((x, xi) => xi !== si)
      this.isbnGlobals = this.isbnGlobals.filter((x, xi) => xi !== si)
    },
    clearSubmission(si) {
      this.books[si] = null
      this.submissions[si] = this.newSubmissionObject()
      this.titleSearches[si] = []
      this.authorSearches[si] = []
      this.illustratorSearches[si] = []
      this.isbnSearches[si] = []
      this.isbnGlobals[si] = false
    },
    clearSearches(si) {
      this.titleSearches[si] = []
      this.authorSearches[si] = []
      this.illustratorSearches[si] = []
      this.isbnSearches[si] = []
    }
  },
  computed: {
    draftable() {
      return this.submissions
        .map(x => x.title.length || x.author.length || x.illustrator.length || x.isbn.length)
        .reduce((acc, x) => x || acc, false)
        && this.books.reduce((acc, x) => x && x.id ? false : acc, true)
    },
    submitable() {
      return this.submissions
        .map(x => x.title.length && x.author.length && Object.keys(x.tags).length)
        .reduce((acc, x) => x && acc, true)
        && this.books.reduce((acc, x) => x && x.id ? false : acc, true)
    }
  },
  components: {
    'author-widget': AuthorWidget
  }
}
</script>

<template>
<h1 class="title page-title">Submit a Book</h1>

<div v-for="(submission, si) of submissions" :key="si">
  <section class="section">

    <div class="field">
      <label class="label">Title</label>
      <div class="control">
        <input :disabled="$uiBusy || (books[si] && books[si].id)" type="text" class="input" @input="titleSearch($event, si)" v-model="submissions[si].title">
        <div v-if="titleSearches[si] && titleSearches[si].length" class="search-wrap">
          <div class="search-results">
            <div @click.prevent="fillBook(res, si)" class="media p-2" v-for="res of titleSearches[si]" :key="res.id">
              <div class="media-left">
                <img :src="res.cover">
              </div>
              <div class="media-right">
                <b>{{res.title}}</b><br>
                <small>{{res.isbn}}</small><br>
                <author-widget :name="res.authors[0]"></author-widget>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="field">
      <label class="label">Author</label>
      <div class="control">
        <input :disabled="$uiBusy || (books[si] && books[si].id)" type="text" class="input" @input="authorSearch($event, si)" v-model="submissions[si].author">
        <div v-if="authorSearches[si] && authorSearches[si].length" class="search-wrap">
          <div class="search-results">
            <div @click.prevent="fillAuthor(res, si)" class="media p-2" v-for="res of authorSearches[si]" :key="res.id">
              <b>{{res.name}}</b><br>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="field">
      <label class="label">Illustrator</label>
      <div class="control">
        <input :disabled="$uiBusy || (books[si] && books[si].id)" type="text" class="input" @input="illustratorSearch($event, si)" v-model="submissions[si].illustrator">
        <div v-if="illustratorSearches[si] && illustratorSearches[si].length" class="search-wrap">
          <div class="search-results">
            <div @click.prevent="fillIllustrator(res, si)" class="media p-2" v-for="res of illustratorSearches[si]" :key="res.id">
              <b>{{res.name}}</b><br>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="field">
      <label class="label">ISBN</label>
      <div class="field has-addons">
        <div class="control w-100">
          <input :disabled="$uiBusy || (books[si] && books[si].id)" type="text" class="input" @input="isbnSearch($event, si)" v-model="submissions[si].isbn">
          <div v-if="isbnSearches[si] && isbnSearches[si].length" class="search-wrap">
            <div class="search-results">
              <div @click.prevent="fillBook(res, si)" class="media p-2" v-for="res of isbnSearches[si]" :key="res.id">
                <div class="media-left">
                  <img :src="res.cover">
                </div>
                <div class="media-right">
                  <b>{{res.title}}</b><br>
                  <small>{{res.isbn}}</small><br>
                  <author-widget :name="res.authors[0]"></author-widget>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="control">
          <button @click="isbnGlobalSearch(si)" :disabled="$uiBusy || (books[si] && books[si].id)" :class="{'is-loading': isbnGlobals[si] === true}" class="button is-primary">
            <i class="fas fa-search"></i>
            <span class="ml-3">Search</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="!!books[si]" class="field">
      <div class="columns">
        <div class="column">
          <img :src="books[si].cover">
        </div>
        <div v-if="books[si].id" class="column">
          GREAT MINDS THINK ALIKE.<br>THIS BOOK IS ALREADY IN OUR DIRECTORY.<br>
          <button class="button is-primary is-outlined" @click="clearSubmission(si)">
            Clear
          </button>
        </div>
        <div v-if="!books[si].id && submissions[si].isAuthor === null" class="column field">
          <label class="label">Is this your book?</label>
          <div class="control mb-3">
            <button @click.prevent="setIsAuthor(si, true)" class="button is-primary is-outlined">Yes</button>
          </div>
          <div class="control mb-3">
            <button @click.prevent="clearSubmission(si)" class="button is-secondary is-outlined">No (clear submission)</button>
          </div>
          <div class="control">
            <button @click.prevent="setIsAuthor(si, false)" class="button is-primary is-outlined">No (but submit info anyway)</button>
          </div>
        </div>
        <div v-if="!books[si].id && (submissions[si].isAuthor === true || submissions[si].isAuthor === false)" class="column field">
          Thank you!
        </div>
      </div>
    </div>

    <div v-if="!books[si] || (books[si] && !books[si].id)" class="field">
      <label class="label">How would you categorize this book? Select all that apply</label>
      <div class="columns-2">
        <div v-for="tag of $store.state.sortedTags" :key="tag.id" class="control columns-2">
          <input :disabled="$uiBusy" :id="tag.id" :name="tag.id" type="checkbox" class="checkbox mr-3" v-model="submissions[si].tags[tag.id]">
          <label class="label d-inline" :for="tag.id">
            {{tag.tag}}
          </label>
        </div>
        <div>
          <label class="label d-inline">Other</label>
          <input :disabled="$uiBusy" class="input" type="text" v-model="submissions[si].otherTags">
        </div>
      </div>
    </div>

  </section>
  <hr>
  <section v-if="submissions.length>1">
    <button @click="delSubmission(si)" class="button is-info is-outlined">
      <i class="fas fa-minus"></i>
      <span class="ml-3">Delete</span>
    </button>
  </section>
</div>

<section class="section">
  <div>
    <button :disabled="$uiBusy" @click.prevent="addMoreSubmission()" class="button is-primary">
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

<style scoped lang="scss">
.label {
  text-decoration: uppercase;
}
.d-inline {
  display: inline !important;
}
.columns-2 {
  column-count: 2;
}

.w-100 {
  width: 100%;
}

.search-wrap {
  position: relative;
  .search-results {
    position: absolute;
    width: 100%;
    max-height: 400px;
    overflow-y: scroll;
    left: 0;
    top: 0;
    z-index: 5;
    background: #fff;
    border: 1px solid;

    img {
      max-height: 60px;
    }

    .media {
      margin: 0 !important;

      &:hover {
        background: #eee;
      }

      .media-left {
        //min-width: 70px;
      }
    }
  }
}
</style>
