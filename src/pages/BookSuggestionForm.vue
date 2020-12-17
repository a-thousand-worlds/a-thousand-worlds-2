<script>

import _ from 'lodash'
import BookTitleField from '@/components/fields/BookTitle'
import BookIsbnField from '@/components/fields/BookIsbn'

import { coverImageByISBN, findBookByTitle } from '@/utils'

export default {
  data() {
    return {
      books: [],
      confirms: [],
      submissions: [],
      coverLoads: []
    }
  },
  created() {
    if (Array.isArray(this.$store.state.user.user?.profile.draftBooks) && this.$store.state.user.user?.profile.draftBooks.length) {
      this.submissions = this.$store.state.user.user?.profile.draftBooks.map(x => {
        if (!x.tags) {
          x.tags = {}
        }
        return x
      })
      this.books = this.submissions.map(sub => {
        return sub.description?.length && sub.cover?.base64?.length ? sub : null
      })
    }
    else {
      this.submissions = [this.newSubmissionObject()]
    }
    window.scrollTo(0, 0)
  },
  methods: {
    isbnGlobalSearchState(si, state) {
      this.$store.commit('ui/setBusy', state)
    },
    isbnGlobalSearchResult(si, res) {
      if (!res) {
        console.log('nothing found')
        return
      }
      const localBook = this.$store.getters['books/filtered']
        .reduce((acc, book) => book.isbn === res.isbn ? book : acc, null)
      if (localBook) {
        this.books[si] = localBook
        return
      }
      this.submissions[si] = { ...this.submissions[si], ...res }
      this.books[si] = res

      this.coverLoads[si] = true
      coverImageByISBN(this.submissions[si].isbn)
        .then(cover => {
          this.coverLoads[si] = false
          if (!cover) return
          this.submissions[si].cover = cover
          this.books[si].cover = cover
        })
    },
    coverImage(si) {
      const cover = this.submissions[si].cover
      return cover ? cover.base64.length ? cover.base64 : cover.url : ''
    },
    setConfirmed(si, state) {
      this.submissions[si].confirmed = state
    },
    submitForReview() {
      this.$store.commit('ui/setBusy', true)
      this.$store.dispatch('bookSubmissions/submit', this.submissions)
        .then(() => {
          this.$store.commit('ui/setBusy', false)
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push({ name: 'Dashboard' })
        })
    },
    saveDraft() {
      this.$store.commit('ui/setBusy', true)
      this.$store.dispatch('user/saveBookSubmissionsDraft', this.submissions)
        .then(() => {
          this.$store.commit('ui/setBusy', false)
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push({ name: 'Dashboard' })
        })
    },
    newSubmissionObject() {
      return {
        title: '',
        authors: '',
        illustrators: '',
        cover: {
          url: '',
          base64: '',
          width: 0,
          height: 0,
        },
        description: '',
        year: '',
        publisher: '',
        isbn: '',
        confirmed: false,
        tags: {},
        otherTag: ''
      }
    },
    addMoreSubmission() {
      // eslint-disable-next-line fp/no-mutating-methods
      this.submissions.push(this.newSubmissionObject())
    },
    delSubmission(si) {
      this.books = this.books.filter((x, xi) => xi !== si)
      this.submissions = this.submissions.filter((x, xi) => xi !== si)
    },
    clearSubmission(si) {
      this.books[si] = null
      this.submissions[si] = this.newSubmissionObject()
    },
    titleChanged: _.debounce(async function(si) {
      // const { author, title } = this.submissions[si]
      let search = this.submissions[si].title
      if (this.submissions[si].author && this.submissions[si].authors.length) {
        search += ' ' + this.submissions[si].author
      }
      const result = await findBookByTitle(search)
      const { isbn, thumbnail } = result || {}
      if (isbn) {
        this.submissions[si].isbn = isbn
        this.books[si] = {
          ...this.books[si],
          cover: thumbnail,
        }
      }
    }, 500)
  },
  computed: {
    draftable() {
      return this.submissions
        .map(x => x.title.length || x.authors.length || x.illustrators.length || x.isbn.length)
        .reduce((acc, x) => x || acc, false)
        && this.books.reduce((acc, x) => x && x.id ? false : acc, true)
    },
    submitable() {
      return this.submissions
        .map(x => x.title.length && x.authors.length)
        .reduce((acc, x) => x && acc, true)
        && this.books.reduce((acc, x) => x && x.id ? false : acc, true)
    }
  },
  components: {
    'book-title-field': BookTitleField,
    'book-isbn-field': BookIsbnField,
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
              <book-title-field :disabled="$uiBusy || (books[si] && books[si].id)" v-model="submissions[si].title" @book-selected="fillBook($event, si)" :searchable="false" @input="titleChanged(si)"/>
            </div>

            <div class="field">
              <label class="label">Author</label>
              <div class="control">
                <input class="input" type="text" :disabled="$uiBusy || (books[si] && books[si].id)" v-model="submissions[si].authors"/>
              </div>
            </div>

            <div class="field">
              <label class="label">Illustrator</label>
              <div class="control">
                <input class="input" type="text" :disabled="$uiBusy || (books[si] && books[si].id)" v-model="submissions[si].illustrators"/>
              </div>
            </div>

            <div class="field">
              <label class="label">ISBN</label>
              <book-isbn-field
                :disabled="$uiBusy || (books[si] && books[si].id)"
                :searchable="true"
                ref="isbn"
                v-model="submissions[si].isbn"
                @book-selected="fillBook($event, si)"
                @isbn-search-state="isbnGlobalSearchState(si, $event)"
                @isbn-search-result="isbnGlobalSearchResult(si, $event)"
              />
            </div>

            <div v-if="!!books[si]" class="field">
              <div class="columns">
                <div class="column">
                  <img v-if="coverLoads[si]" src="@/assets/icons/loading.gif">
                  <img :src="coverImage(si)">
                </div>
                <div v-if="books[si].id" class="column">
                  <p class="mb-10 mr-50 is-uppercase">Great minds think alike. This book is already in our directory.</p>
                  <button class="button is-rounded" @click="clearSubmission(si)">
                    Clear Info
                  </button>
                </div>
                <div v-if="books[si] && !submissions[si].confirmed" class="column field">
                  <label class="label">Is this your book?</label>
                  <div class="control mb-3">
                    <button @click.prevent="setConfirmed(si, true)" class="button is-primary is-outlined">Yes</button>
                  </div>
                  <div class="control mb-3">
                    <button @click.prevent="clearSubmission(si)" class="button is-secondary is-outlined">No (clear submission)</button>
                  </div>
                  <div class="control">
                    <button @click.prevent="setConfirmed(si, true)" class="button is-primary is-outlined">No (but submit info anyway)</button>
                  </div>
                </div>
                <!--
                <div v-if="submissions[si].confirmed" class="column field">
                  Thank you!
                </div>
                -->
              </div>
            </div>

            <div v-if="!books[si] || (books[si] && !books[si].id)" class="field">
              <label class="label">How would you categorize this book? Select all that apply</label>
              <div class="text-14 tablet-columns-2">
                <div v-for="tag of $store.getters['tags/list']" :key="tag.id" class="control">
                  <input :disabled="$uiBusy" :id="tag.id+'-'+si" :name="tag.id" type="checkbox" class="checkbox mr-3 mb-3" v-model="submissions[si].tags[tag.id]">
                  <label class="label d-inline" :for="tag.id+'-'+si">
                    {{tag.tag}}
                  </label>
                </div>
                <div>
                  <input :disabled="$uiBusy" type="checkbox" class="checkbox mr-3 mb-3" v-model="submissions[si].tags.other">
                  <label class="label d-inline">Other</label>
                  <input :disabled="$uiBusy" class="input" type="text" v-model="submissions[si].otherTag">
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
