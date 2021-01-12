<script>
import _ from 'lodash'
import validator from '@/mixins/validator'

export default {
  mixins: [
    validator(function() {
      return this.submissions
        .flatMap(this.validateSubmission)
        .filter(x => x)
    })
  ],
  data() {
    return {
      draftSaved: null,
      submission: {},
    }
  },
  computed: {
  },
  created() {
    this.submission = this.$store.state.user.user?.profile.draftPerson || {}
  },
  methods: {

    clear() {
      this.submission = {}
      this.clearDraft()
    },

    clearDraft() {
      this.$store.dispatch('user/savePersonSubmissionDraft', [])
      clearTimeout(this.draftSaved)
      this.draftSaved = null
    },

    saveDraft: _.debounce(function() {
      clearTimeout(this.draftSaved)
      this.$store.dispatch('user/savePersonSubmissionDraft', this.submission)
      this.draftSaved = setTimeout(() => {
        this.draftSaved = null
      }, 3000)
    }, 500),

    async submitForReview() {

      if (!this.validate()) return

      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch('submissions/books/submit', this.submission)
      this.$store.commit('ui/setBusy', false)
      this.$router.push({ name: 'SubmissionThankYou', params: { type: 'book' } })
    },

  },
}
</script>

<template>

  <div class="mx-20 mb-30">
    <div class="is-flex is-justify-content-center">
      <form class="is-flex-grow-1" style="max-width: 540px;" @submit.prevent="submitForReview">

        <h1 class="title page-title divider-bottom">Create a profile</h1>

        <section class="basic-information">

          <div class="field">
            <label class="label" :class="{ 'has-text-danger': hasError('title') }" :for="titleId">Title</label>
            <input v-model="sub.title" :inputClass="{ 'is-danger': hasError('title') }" :inputId="titleId" @book-selected="fillBook($event, si)" />
          </div>

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

        <hr>

        <div class="field is-grouped">
          <button :class="{'is-loading': $uiBusy}" class="button is-rounded is-primary mr-20" @click.prevent="submitForReview()">Submit for review</button>
          <button class="button is-rounded" @click.prevent="clear">Reset</button>
          <button v-if="draftSaved" class="button is-flat" @click.prevent="saveDraft" style="cursor: text;">Draft Saved</button>
        </div>

        <div v-if="errors.length" class="field">
          <p v-for="(error, i) of errors" :key="i" class="error has-text-centered is-uppercase">{{ error.message }}</p>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/style/vars.scss';

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
