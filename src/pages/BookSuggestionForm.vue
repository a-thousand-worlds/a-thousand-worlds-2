<script>

export default {
  data() {
    return {
      submissions: []
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
      this.submissions = [{
        title: '',
        author: '',
        illustrator: '',
        isbn: '',
        tags: {},
        otherTag: ''
      }]
    }
    window.scrollTo(0, 0)
  },
  methods: {
    titleSearch($e) {
      console.log('title', $e.target.value)
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
    addMoreSubmission() {
      // eslint-disable-next-line fp/no-mutating-methods
      this.submissions.push({
        title: '',
        author: '',
        illustrator: '',
        isbn: '',
        tags: {},
        otherTag: ''
      })
    }
  },
  computed: {
    draftable() {
      return this.submissions
        .map(x => x.title.length || x.author.length || x.illustrator.length || x.isbn.length)
        .reduce((acc, x) => x || acc, false)
    },
    submitable() {
      return this.submissions
        .map(x => x.title.length && x.author.length && Object.keys(x.tags).length)
        .reduce((acc, x) => x && acc, true)
    }
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
        <input :disabled="$uiBusy" type="text" class="input" @input="titleSearch($event)" v-model="submissions[si].title">
      </div>
    </div>

    <div class="field">
      <label class="label">Author</label>
      <div class="control">
        <input :disabled="$uiBusy" type="text" class="input" v-model="submissions[si].author">
      </div>
    </div>

    <div class="field">
      <label class="label">Illustrator</label>
      <div class="control">
        <input :disabled="$uiBusy" type="text" class="input" v-model="submissions[si].illustrator">
      </div>
    </div>

    <div class="field">
      <label class="label">ISBN</label>
      <div class="control">
        <input :disabled="$uiBusy" type="text" class="input" v-model="submissions[si].isbn">
      </div>
    </div>

    <div class="field">
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
</style>
