<script>
import _ from 'lodash'
import ISBN from 'isbn3'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'
import BookTitleField from '@/components/fields/BookTitle'
import { findBookByKeyword, metadataByISBN } from '@/utils'

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
      editor: BalloonEditor,
      loadingBook: [],
      submissions: [],
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
    draftable() {
      return this.submissions.every(sub => sub.title || sub.authors || sub.illustrators || sub.isbn)
        && !this.books.some(book => book?.id)
    },
    submitable() {
      return this.submissions.every(sub => sub.title && sub.authors && sub.isbn && sub.confirmed !== null)
        && !this.books.some(book => book?.id)
    }
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
    window.scrollTo(0, 0)
  },
  methods: {
    coverImage(si) {
      const cover = this.books[si]?.cover || this.submissions[si].thumbnail
      return typeof cover === 'string'
        ? cover
        : cover?.base64?.url || ''
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
    },
    async submitForReview() {
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch('bookSubmissions/submit', this.submissions)
      this.$store.commit('ui/setBusy', false)
      // eslint-disable-next-line fp/no-mutating-methods
      this.$router.push({ name: 'SubmissionThankYou' })
    },
    async saveDraft() {
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch('user/saveBookSubmissionsDraft', this.submissions)
      this.$store.commit('ui/setBusy', false)
    },
    newSubmissionObject() {
      return {
        authors: '',
        confirmed: null,
        illustrators: '',
        isbn: '',
        otherTag: '',
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
    titleOrAuthorChanged: _.debounce(async function(si) {
      const { authors, title } = this.submissions[si]
      if (!authors || !title) {
        this.submissions[si].isbn = null
        this.submissions[si].confirmed = null
        this.submissions[si].thumbnail = ''
        return
      }

      this.loadingBook[si] = true
      const search = `${title} by ${authors}`
      const result = await findBookByKeyword(search)
      this.loadingBook[si] = false
      const { isbn, thumbnail } = result || {}
      if (isbn && isbn !== this.submissions[si].isbn) {
        this.submissions[si].isbn = isbn
        this.submissions[si].thumbnail = thumbnail
      }
    }, 500),
    // populate empty and suggested fields with metadata
    updateMetadata: _.debounce(async function(si) {
      const sub = this.submissions[si]
      sub.loadingMetadata = true
      const meta = await metadataByISBN(sub.isbn)
      sub.loadingMetadata = false
      if (meta) {
        this.suggested = meta
        if (meta.summary && !sub.summary) sub.summary = meta.summary
        if (meta.goodread && !sub.goodread) sub.goodread = meta.goodread
        if (meta.publisher && !sub.publisher) sub.publisher = meta.publisher
        if (meta.year && !sub.year) sub.year = meta.year
      }
    }, 500),
  },
}
</script>

<template>

  <div class="mx-20">
    <div class="is-flex is-justify-content-center">
      <form class="is-flex-grow-1" style="max-width: 540px;" @submit.prevent="submit">

        <h1 class="title page-title divider-bottom">Submit a book</h1>

        <div v-for="(sub, si) of submissions" :key="si">
          <section class="basic-information">

            <div class="field">
              <label class="label">Title</label>
              <book-title-field :disabled="$uiBusy || (books[si] && books[si].id)" v-model="sub.title" @book-selected="fillBook($event, si)" :searchable="false" @input="titleOrAuthorChanged(si)"/>
            </div>

            <div class="field">
              <label class="label">Author(s)</label>
              <div class="control">
                <input class="input" type="text" :disabled="$uiBusy || (books[si]?.id)" v-model="sub.authors" @input="titleOrAuthorChanged(si)"/>
              </div>
            </div>

            <div class="field">
              <label class="label">Illustrator(s)</label>
              <div class="control">
                <input class="input" type="text" :disabled="$uiBusy || (books[si]?.id)" v-model="sub.illustrators"/>
              </div>
            </div>

            <div v-if="loadingBook[si] || books[si] || coverImage(si)" class="field">
              <div class="columns">

                <!-- cover/loading -->
                <div class="column is-narrow">
                  <img v-if="loadingBook[si]" src="@/assets/icons/loading.gif">
                  <div v-else class="bg-secondary">
                    <img :src="coverImage(si)" style="display: block; min-width: 100px; max-width: 265px;" :style="sub.confirmed === false && !books[si] ? { visibility: 'hidden' } : null" />
                  </div>
                </div>
                <div class="column">

                  <!-- Duplicate -->
                  <div v-if="books[si]">
                    <p class="mb-10 is-uppercase" style="font-weight: bold; max-width: 265px;">Great minds think alike. This book is already in our directory.</p>
                    <button class="button is-rounded" @click="clearSubmission(si)">
                      Clear Info
                    </button>
                  </div>

                  <!-- Is this your book? -->
                  <div v-else-if="coverImage(si)" class="column field">
                    <div class="control mb-20">
                      <label class="label">Is this your book?</label>
                      <button @click.prevent="setConfirmed(si, true)" class="button is-rounded mr-2" :class="{ 'is-primary': sub.confirmed !== false, 'is-selected': sub.confirmed }" :disabled="sub.confirmed" :style="sub.confirmed ? { cursor: 'default' } : null">Yes</button>
                      <button @click.prevent="setConfirmed(si, false)" class="button is-rounded" :class="{ 'is-primary': sub.confirmed === false }" :disabled="sub.confirmed === false" :style="sub.confirmed === false ? { cursor: 'default' } : null">No</button>
                    </div>
                    <div v-if="sub.confirmed === false" class="control">
                      <label class="label">Okay, please enter the ISBN:</label>
                      <input class="input" v-model="sub.isbn" @input="updateMetadata(si)" />
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
            <div class="field">
              <label class="label">Summary</label>
              <div style="border-radius: 4px; border: solid 1px #dbdbdb; color: #363636;">
                <ckeditor :disabled="$uiBusy || submissions[si].oadingMetadata || (books[si]?.id)" :editor="editor" :config="ckConfig" v-model="sub.summary" />
              </div>
            </div>

            <!-- optional questions -->
            <div v-if="!books[si] || (books[si] && !books[si].id)" class="field">
              <label class="label">How would you categorize this book? Select all that apply</label>
              <div class="text-14 tablet-columns-2">
                <div v-for="tag of $store.getters['tags/list']" :key="tag.id" class="control">
                  <input :disabled="$uiBusy" :id="tag.id+'-'+si" :name="tag.id" type="checkbox" class="checkbox mr-3 mb-3" v-model="sub.tags[tag.id]">
                  <label class="label d-inline" :for="tag.id+'-'+si">
                    {{tag.tag}}
                  </label>
                </div>
                <div>
                  <input :disabled="$uiBusy" type="checkbox" class="checkbox mr-3 mb-3" v-model="sub.tags.other">
                  <label class="label d-inline">Other</label>
                  <input :disabled="$uiBusy" class="input" type="text" v-model="sub.otherTag">
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
          <button :disabled="!draftable || $uiBusy" :class="{'is-loading':$uiBusy}" @click.prevent="saveDraft()" class="button is-rounded is-fullwidth mr-20">Save as draft</button>
          <button :disabled="!submitable || $uiBusy" :class="{'is-loading':$uiBusy}" @click.prevent="submitForReview()" class="button is-rounded is-primary is-fullwidth">Submit for review</button>
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
