<script>
import _ from 'lodash'
import ISBN from 'isbn3'
import { v4 as uid } from 'uuid'
// import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'
import BookTitleField from '@/components/fields/BookTitle'
import { findBookByKeyword, metadataByISBN } from '@/utils'
import isValidISBN from '@/util/isValidISBN'

export default {
  components: {
    'book-title-field': BookTitleField,
  },
  data() {
    return {
      ckConfig: {
        toolbar: []
      },
      confirms: [],
      // editor: BalloonEditor,
      errors: [],
      loadingBook: [],
      submissions: [],
      titleId: uid(),
    }
  },
  computed: {
    books() {
      return this.submissions.map(({ confirmed, isbn }) =>
        confirmed === null ? null : Object.values(this.$store.state.books.data || {}).find(
          // note that hardcover and softcover have different ISBNs, so duplicates cannot be detected automatically
          book => ISBN.asIsbn10(book.isbn || '') === ISBN.asIsbn10(isbn || '')
        )
      )
    },
  },
  created() {
    if (Array.isArray(this.$store.state.user.user?.profile.draftBooks) && this.$store.state.user.user?.profile.draftBooks.length) {
      this.submissions = this.$store.state.user.user?.profile.draftBooks.map(book => {
        if (!book.tags) {
          book.tags = {}
        }
        return book
      })
    }
    else {
      this.submissions = [this.newSubmissionObject()]
    }
  },
  methods: {
    coverImage(si) {
      const cover = this.books[si]?.cover || this.submissions[si].thumbnail
      return typeof cover === 'string'
        ? cover
        : cover?.base64?.url || ''
    },

    hasError(name) {
      return this.errors.some(error => error.name === name)
    },

    async setConfirmed(si, state) {

      const sub = this.submissions[si]

      sub.confirmed = state
      if (state) {
        if (sub.isbnLastFound) {
          sub.isbn = sub.isbnLastFound
        }
        this.updateMetadata(si)
      }
      else if (state === false) {
        sub.isbnLastFound = sub.isbn
        sub.isbn = null
      }
      else if (state === null) {
        sub.isbn = null
      }

      this.revalidate()
    },
    async submitForReview() {

      if (!this.validate()) return

      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch('bookSubmissions/submit', this.submissions)
      this.$store.commit('ui/setBusy', false)
      this.$router.push({ name: 'SubmissionThankYou', params: { type: 'book' } })
    },
    async saveDraft() {
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch('user/saveBookSubmissionsDraft', this.submissions)
      this.$store.commit('ui/setBusy', false)
    },
    newSubmissionObject() {
      return {
        attempts: 0,
        authors: '',
        confirmed: null,
        illustrators: '',
        isbn: '',
        publisher: '',
        summary: '',
        tags: {},
        thumbnail: '',
        title: '',
        year: '',
        loadingMetadata: false,
      }
    },
    addMoreSubmission() {
      // eslint-disable-next-line fp/no-mutating-methods
      this.submissions.push(this.newSubmissionObject())
    },
    delSubmission(si) {
      this.submissions = this.submissions.filter((x, xi) => xi !== si)
    },
    clearSubmission(si) {
      this.submissions[si] = this.newSubmissionObject()
    },

    metadataInputsChanged(si) {
      this.metadataInputsChangedDebounced(si)
      this.revalidate()
    },

    metadataInputsChangedDebounced: _.debounce(async function(si) {
      const { authors, illustrators, title } = this.submissions[si]
      this.setConfirmed(si, null)
      this.submissions[si].attempts = 0
      if (!title || (!authors && !illustrators)) {
        this.submissions[si].isbn = null
        this.submissions[si].confirmed = null
        this.submissions[si].thumbnail = ''
        return
      }

      this.loadingBook[si] = true
      const search = `${title} by ${authors} ${illustrators}`
      const result = await findBookByKeyword(search)
      this.submissions[si].attempts = 1
      this.loadingBook[si] = false
      const { isbn, thumbnail } = result || {}
      if (isbn && isbn !== this.submissions[si].isbn) {
        this.submissions[si].isbn = isbn
        this.submissions[si].thumbnail = thumbnail
      }
      else {
        this.submissions[si].isbn = null
        this.submissions[si].confirmed = null
        this.submissions[si].thumbnail = ''
        this.setConfirmed(si, false)
      }
    }, 500),

    // populate empty and suggested fields with metadata
    updateMetadata: _.debounce(async function(si) {
      const sub = this.submissions[si]
      sub.loadingMetadata = true
      const meta = await metadataByISBN(sub.isbn)
      sub.loadingMetadata = false
      if (!meta) return
      this.suggested = meta
      if (meta.summary && !sub.summary) sub.summary = meta.summary
      if (meta.goodread && !sub.goodread) sub.goodread = meta.goodread
      if (meta.publisher && !sub.publisher) sub.publisher = meta.publisher
      if (meta.year && !sub.year) sub.year = meta.year

      // correct capitalization of user title but do not override (will be validated during approval)
      if (meta.title && meta.title?.toLowerCase() === sub.title.toLowerCase()) sub.title = meta.title

      // set authors or illustrators only if not specified by user (will be validated during approval)
      if (meta.authors?.length && meta.authors?.join(', ') !== sub.authors && !sub.authors) sub.authors = meta.authors.join(', ')
      if (meta.illustrators?.length && meta.illustrators?.join(', ') !== sub.illustrators && !sub.illustrators) sub.illustrators = meta.illustrators.join(', ')
    }, 500),

    async searchManualIsbn(si) {
      if (!isValidISBN(this.submissions[si].isbn)) return

      this.loadingBook[si] = true
      const search = `${this.submissions[si].isbn}`
      const result = await findBookByKeyword(search)
      this.loadingBook[si] = false
      const { isbn, thumbnail } = result || {}
      if (isbn) {
        this.submissions[si].isbn = isbn
        this.submissions[si].thumbnail = thumbnail
        this.submissions[si].attempts++
        this.updateMetadata(si)
      }
      this.setConfirmed(si, null)
    },

    validateSubmission(sub) {
      return [
        !sub.title ? { name: 'title', message: 'Title is required' } : null,
        !sub.authors ? { name: 'authors', message: 'Author is required' } : null,
        sub.confirmed === null ? { name: 'confirm', message: 'Confirm book' } : null,
        Object.keys(sub.tags).length === 0 ? { name: 'tags', message: 'Tags are required' } : null,
      ].filter(x => x)
    },

    validate() {

      this.errors = this.submissions
        .flatMap(this.validateSubmission)
        .filter(x => x)

      return this.errors.length === 0
    },

    revalidate: _.throttle(function() {
      if (this.errors.length > 0) {
        this.validate()
      }
    }, 500)

  },
}
</script>

<template>

  <div class="mx-20 mb-30">
    <div class="is-flex is-justify-content-center">
      <form class="is-flex-grow-1" style="max-width: 540px;" @submit.prevent="submitForReview">

        <h1 class="title page-title divider-bottom">Submit a book</h1>

        <div v-for="(sub, si) of submissions" :key="si">
          <section class="basic-information">

            <div class="field">
              <label class="label" :class="{ 'has-text-danger': hasError('title') }" :for="titleId">Title</label>
              <book-title-field v-model="sub.title" :disabled="$uiBusy || (books[si]?.id)" :inputClass="{ 'is-danger': hasError('title') }" :inputId="titleId" :searchable="false" @book-selected="fillBook($event, si)" @input="metadataInputsChanged(si)" />
            </div>

            <div class="field">
              <label class="label" :class="{ 'has-text-danger': hasError('authors') }" for="authors">Author(s)</label>
              <div class="control">
                <input id="authors" v-model="sub.authors" class="input" :class="{ 'is-danger': hasError('authors') }" type="text" :disabled="$uiBusy || (books[si]?.id)" @input="metadataInputsChanged(si)">
              </div>
            </div>

            <div class="field">
              <label class="label" for="illustrators">Illustrator(s)</label>
              <div class="control">
                <input id="illustrators" v-model="sub.illustrators" class="input" type="text" :disabled="$uiBusy || (books[si]?.id)" @input="metadataInputsChanged(si)">
              </div>
            </div>

            <div v-if="loadingBook[si] || books[si] || coverImage(si) || sub.confirmed === false" class="field">
              <div class="columns">

                <!-- cover/loading -->
                <div class="column is-narrow">
                  <img v-if="loadingBook[si]" role="loading" src="@/assets/icons/loading.gif">
                  <div v-else class="bg-secondary">
                    <img :src="coverImage(si) || sub.confirmed === false" role="thumbnail" alt="thumbnail" style="display: block; min-width: 120px; min-height: 150px; max-width: 265px;" :style="sub.confirmed === false && !books[si] ? { visibility: 'hidden' } : null">
                  </div>
                </div>
                <div class="column is-flex is-align-items-center">

                  <!-- Duplicate -->
                  <div v-if="books[si]">
                    <p class="mb-10 is-uppercase" style="font-weight: bold; max-width: 265px;">Great minds think alike. This book is already in our directory.</p>
                    <button class="button is-rounded" @click="clearSubmission(si)">
                      Clear Info
                    </button>
                  </div>

                  <!-- Is this your book? -->
                  <div v-else-if="!loadingBook[si] && (coverImage(si) || sub.confirmed === false)" class="column field">
                    <div v-if="sub.confirmed === null" class="control mb-20">
                      <label class="label" :class="{ 'has-text-danger': hasError('tags') }">Is this your book?</label>
                      <div class="field" :class="{ 'is-grouped': sub.attempts === 1 }">
                        <div class="control mb-2">
                          <button class="button is-rounded" :class="{ 'is-primary': sub.confirmed !== false, 'is-selected': sub.confirmed }" :disabled="sub.confirmed" :style="sub.confirmed ? { cursor: 'default' } : null" @click.prevent="setConfirmed(si, true)">Yes</button>
                        </div>
                        <div class="control mb-2">
                          <button class="button is-rounded" @click.prevent="setConfirmed(si, false)">No{{ sub.attempts > 1 ? ', try again' : '' }}</button>
                        </div>
                        <div class="control mb-2">
                          <button v-if="sub.attempts > 1" class="button is-rounded" @click.prevent="setConfirmed(si, true)">No, but keep anyway</button>
                        </div>
                      </div>
                    </div>
                    <div v-if="sub.confirmed === true" class="control">
                      <label class="label">{{ sub.attempts > 1 ? 'Got it' : 'Great' }} - Thanks!</label>
                    </div>
                    <div v-if="sub.confirmed === false" class="control">
                      <div class="field mb-20">
                        <label v-if="!sub.thumbnail" class="label">Hmmm... we couldn't find that book.</label>
                        <label for="isbn" class="label" style="margin-right: -20px;">{{ sub.thumbnail ? 'Okay, ' : '' }}please enter the ISBN:</label>
                        <div class="control">
                          <input id="isbn" v-model="sub.isbn" class="input" :disabled="$uiBusy">
                        </div>
                      </div>
                      <div class="field">
                        <div class="control">
                          <button class="button is-rounded is-primary" :disabled="!sub.isbn" @click="searchManualIsbn(si)">Search</button>
                          <button class="button is-flat" @click="setConfirmed(si, null)">Cancel</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!--
                  <div v-if="sub.confirmed" class="column field">
                    Thank you!
                  </div>
                  -->
                </div>
              </div>
            </div>

            <!-- summary -->
            <!--
            <div class="field">
              <label class="label">Summary</label>
              <div style="border-radius: 4px; border: solid 1px #dbdbdb; color: #363636;">
                <ckeditor :disabled="$uiBusy || submissions[si].oadingMetadata || (books[si]?.id)" :editor="editor" :config="ckConfig" v-model="sub.summary" />
              </div>
            </div>
            -->

            <!-- tags -->
            <div v-if="!books[si] || (books[si] && !books[si].id)" class="field">
              <label class="label" :class="{ 'has-text-danger': hasError('tags') }">How would you categorize this book? Select all that apply</label>
              <div class="text-14 tablet-columns-2">
                <div v-for="tag of $store.getters['tags/books/listSorted']()" :key="tag.id" class="control is-flex">
                  <input :id="tag.id+'-'+si" v-model="sub.tags[tag.id]" :name="tag.id" type="checkbox" class="checkbox mr-3 mb-3 mt-1" @input="revalidate">
                  <label class="label mb-1" :for="tag.id+'-'+si">
                    {{ tag.tag }}
                  </label>
                </div>
              </div>
            </div>

          </section>

          <section v-if="submissions.length>1">
            <button class="button is-rounded" @click="delSubmission(si)">
              <i class="fas fa-minus" />
              <span class="ml-3">Delete</span>
            </button>
          </section>

          <hr class="double">

        </div>

        <div>
          <button :disabled="$uiBusy" class="button is-rounded" @click.prevent="addMoreSubmission()">
            <i class="fas fa-plus" />
            <span class="ml-2">Add another book</span>
          </button>
        </div>

        <hr>

        <div class="field is-grouped">
          <button :class="{'is-loading':$uiBusy}" class="button is-rounded is-fullwidth mr-20" @click.prevent="saveDraft()">Save as draft</button>
          <button :class="{'is-loading': $uiBusy}" class="button is-rounded is-primary is-fullwidth" @click.prevent="submitForReview()">Submit for review</button>
        </div>

        <div v-if="errors.length" class="field">
          <p v-for="(error, i) of errors" :key="i" class="error has-text-centered is-uppercase">{{ error.message }}</p>
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
    z-index: $zField;
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
