<script>

import BookTitleField from '@/components/fields/BookTitle'
import BookIsbnField from '@/components/fields/BookIsbn'
import PersonField from '@/components/fields/Person'

export default {
  data() {
    return {
      books: [],
      otherTag: null,
      submissions: [],
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
    isbnGlobalSearchState(si, state) {
      this.$store.commit('setBusy', state)
    },
    isbnGlobalSearchResult(si, res) {
      if (!res) {
        console.log('nothing found')
        return
      }
      console.log('isbn global search res', res)
      const localBook = this.$store.state.booksList
        .reduce((acc, book) => book.isbn === res.isbn ? book : acc, null)
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
    },
    fillBook(book, si) {
      console.log('fill book', book)
      if (book) {
        this.books[si] = book
        this.submissions[si].title = book.title
        this.submissions[si].isbn = book.isbn
        this.submissions[si].author = this.$store.state.peopleList.reduce((acc, x) => {
          if (book.authors.includes(x.name) && x.role === 'author') {
            if (acc !== '') {
              acc += ', '
            }
            acc += x.name
          }
          return acc
        }, '')
        this.submissions[si].illustrator = this.$store.state.peopleList.reduce((acc, x) => {
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
    setIsAuthor(si, state) {
      this.submissions[si].isAuthor = state
    },
    submitForReview() {
      console.log('save', this.submissions)
      this.$store.dispatch('submitBookSubmission', this.submissions).then(() => {
        console.log('book saved')
        // eslint-disable-next-line fp/no-mutating-methods
        this.$router.push({ name: 'Profile' })
      })
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
    },
    clearSubmission(si) {
      this.books[si] = null
      this.submissions[si] = this.newSubmissionObject()
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
    'book-title-field': BookTitleField,
    'book-isbn-field': BookIsbnField,
    'person-field': PersonField
  }
}
</script>

<template>

  <div class="mx-20">
    <div class="is-flex is-justify-content-center">
      <form class="is-flex-grow-1" style="max-width: 540px;" @submit.prevent="submit">

        <h1 class="title page-title divider-bottom">Submit a book</h1>

        <div v-for="(submission, si) of submissions" :key="si">
          <section class="basic-information">

            <div class="field">
              <label class="label">Book Title</label>
              <book-title-field :disabled="$uiBusy || (books[si] && books[si].id)" v-model="submissions[si].title" @book-selected="fillBook($event, si)"/>
            </div>

            <div class="field">
              <label class="label">Author</label>
              <person-field :disabled="$uiBusy || (books[si] && books[si].id)" v-model="submissions[si].author" @person-selected="fillAuthor($event, si)" :role="'author'"/>
            </div>

            <div class="field">
              <label class="label">Illustrator</label>
              <person-field :disabled="$uiBusy || (books[si] && books[si].id)" v-model="submissions[si].illustrator" @person-selected="fillIllustrator($event, si)" :role="'illustrator'"/>
            </div>

            <div class="field">
              <label class="label">ISBN</label>
              <book-isbn-field
                :disabled="$uiBusy || (books[si] && books[si].id)"
                :searchable="true"
                v-model="submissions[si].isbn"
                @book-selected="fillBook($event, si)"
                @isbn-search-state="isbnGlobalSearchState(si, $event)"
                @isbn-search-result="isbnGlobalSearchResult(si, $event)"
              />
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
              <div class="text-14 tablet-columns-2">
                <div v-for="tag of $store.state.sortedTags" :key="tag.id" class="control">
                  <input :disabled="$uiBusy" :id="tag.id" :name="tag.id" type="checkbox" class="checkbox mr-3 mb-3" v-model="submissions[si].tags[tag.id]">
                  <label class="label d-inline" :for="tag.id">
                    {{tag.tag}}
                  </label>
                </div>
                <div>
                  <input :disabled="$uiBusy" type="checkbox" class="checkbox mr-3 mb-3" v-model="otherTag">
                  <label class="label d-inline">Other</label>
                  <input :disabled="$uiBusy" class="input" type="text" v-model="submissions[si].otherTags">
                </div>
              </div>
            </div>

          </section>

          <section v-if="submissions.length>1">
            <button @click="delSubmission(si)" class="button is-rounded">
              <i class="fas fa-minus"></i>
              <span class="ml-3">Delete</span>
            </button>
          </section>

          <hr class="double" />

        </div>

        <div>
          <button :disabled="$uiBusy" @click.prevent="addMoreSubmission()" class="button is-rounded">
            <i class="fas fa-plus"></i>
            <span class="ml-2">Add another book</span>
          </button>
        </div>

        <hr />

        <div class="field is-grouped">
          <button :disabled="!draftable||$uiBusy" :class="{'is-loading':$uiBusy}" @click.prevent="saveDraft()" class="button is-rounded is-fullwidth mr-20">Save as draft</button>
          <button :disabled="!submitable||$uiBusy" :class="{'is-loading':$uiBusy}" @click.prevent="submitForReview()" class="button is-rounded is-primary is-fullwidth">Submit for review</button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

.text-14 .label {
  font-size: 14px;
}

.basic-information > .field {
  margin-bottom: 30px;
}

.label {
  text-transform: uppercase;
  font-size: 18px;
}
.d-inline {
  display: inline !important;
}
.tablet-columns-2 {
  column-count: 1;

  @include from($tablet) {
    column-count: 2;
  }
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
    }

  }
}
</style>
