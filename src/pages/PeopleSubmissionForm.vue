<script>
import _ from 'lodash'
// Jimp required if dimensions checks needs to be done on file upload
// import Jimp from 'jimp'
import validator from '@/mixins/validator'
import genders from '@/store/constants/genders'

export default {
  mixins: [
    validator(function() {
      return [
        !this.submission.name && { name: 'name', message: 'Name required' },
        !this.submission.title && { name: 'title', message: 'Title required' },
      ].filter(x => x)
    })
  ],
  data() {
    return {
      draftSaved: null,
      genders,
      submission: this.newSubmission(),
    }
  },
  computed: {
    name() {
      return this.$store.state.user.user?.profile.name
    },
    draftPerson() {
      return this.$store.state.user.user?.profile.draftPerson
    },
    person() {
      const peopleSubmissions = this.$store.state.submissions.people.data || {}
      const userSubmissions = this.$store.state.user.user.profile.submissions || {}
      const peopleSubmissionId = Object.keys(userSubmissions)
        .find(sid => peopleSubmissions[sid]?.type === 'people' && peopleSubmissions[sid]?.status === 'approved')
      const peopleId = peopleSubmissions[peopleSubmissionId]?.peopleSubmissionId
      const person = this.$store.state.people.data[peopleId]
      return person
    },
    bgPhoto() {
      return this.submission.photo.base64?.length
        ? this.submission.photo.base64
        : null
    }
  },
  watch: {
    // update submission when draftPerson is first loaded
    draftPerson(next, prev) {
      if (next && !prev) {
        this.submission = {
          ...this.newSubmission(),
          ...this.$store.state.user.user?.profile.draftPerson
        }
      }
    },
    // update submission when person is first loaded
    person(next, prev) {
      if (next && !prev) {
        this.submission = this.newSubmission()
      }
    },
  },
  created() {
    this.submission = {
      ...this.newSubmission(),
      ...this.$store.state.user.user?.profile.draftPerson
    }
  },
  methods: {

    reset() {
      this.submission = this.newSubmission()
      this.errors = []
      this.clearDraft()
    },

    clearDraft() {
      this.$store.dispatch('user/savePersonSubmissionDraft', [])
      clearTimeout(this.draftSaved)
      this.draftSaved = null
    },

    /** Creates a new submission object that is either blank or copied from the existing person. */
    newSubmission() {
      const emptySubmission = {
        awards: '',
        bio: '',
        bonus: '',
        curateInterest: '',
        gender: '',
        identities: {},
        name: '',
        photo: {
          base64: ''
        },
        title: 'author',
      }
      const newPerson = {
        ...emptySubmission,
        // name from private user profile
        name: this.name,
        // copy all relevant fields from person
        ..._.pick(this.person, Object.keys(emptySubmission)),
        // copy identities object, otherwise editing the form will update the person identities object by reference
        identities: this.person?.identities ? { ...this.person.identities } : {}
      }
      return newPerson
    },

    saveDraftAndRevalidate: _.debounce(function() {
      this.revalidate()
      clearTimeout(this.draftSaved)
      this.$store.dispatch('user/savePersonSubmissionDraft', this.submission)
      this.draftSaved = setTimeout(() => {
        this.draftSaved = null
      }, 3000)
    }, 500),

    async submitForReview() {

      if (!this.validate()) return

      this.$store.commit('ui/setBusy', true)
      try {
        await this.$store.dispatch('submissions/people/submit', this.submission)
        this.$store.commit('ui/setBusy', false)
        this.$router.push({ name: 'Dashboard' })
      }
      catch (e) {
        console.error(e)
        this.errors = [{ name: 'submit', message: e.message }]
        this.$store.commit('ui/setBusy', false)
      }
    },

    fileChange(e) {
      const file = e.target.files[0]
      const reader = new FileReader()
      this.submission.photo.base64 = ''
      reader.onload = () => {
        this.submission.photo.base64 = reader.result
        // any additional checks on file size or type, using file.size, file.type
        // can be done here
        // if additional checks on file dimensions required - jimp is required
        /*
        Jimp.read(reader.result, (err, img) => {
          if (err) {
            console.error('jimp error', err)
          }
          if (img) {
            if (img.bitmap.width !== img.bitmap.height) {
              alert('recommended to use square images')
            }
            this.saveDraftAndRevalidate()
          }
        })
        */
        this.saveDraftAndRevalidate()
      }
      reader.onerror = err => {
        console.error('FileReader error', err)
      }
      reader.readAsDataURL(file)
    },

    clearPhoto() {
      this.submission.photo.base64 = ''
      this.saveDraftAndRevalidate()
    },

  },
}
</script>

<template>

  <div class="mx-20 mb-30">

    <div class="is-flex is-justify-content-center">
      <form class="is-flex-grow-1" style="max-width: 540px;" @submit.prevent="submitForReview">

        <div class="mb-5">
          <router-link :to="{ name: 'Dashboard' }" class="is-uppercase is-primary">&lt; Back to Dashboard</router-link>
        </div>

        <h1 class="title page-title divider-bottom">{{ person ? 'Edit public profile' : 'Create a profile' }}</h1>

        <section class="basic-information">

          <!-- photo -->
          <div class="field">
            <label class="label" :class="{ 'has-text-danger': hasError('photo') }" style="font-weight: bold; text-transform: uppercase;">Your Photo</label>
            <div>
              <img v-if="bgPhoto" :src="bgPhoto">
              <label for="photo-field" class="upload-label">
                <span v-if="bgPhoto">Upload other photo (replace)</span>
                <span v-else>Upload</span>
              </label>
              <label v-if="bgPhoto" class="upload-label ml-5" @click.prevent="clearPhoto()">Remove photo</label>
              <input id="photo-field" type="file" class="is-invisible" @change.prevent="fileChange($event)">
            </div>
          </div>

          <!-- name -->
          <div class="field">
            <label class="label" :class="{ 'has-text-danger': hasError('name') }" style="font-weight: bold; text-transform: uppercase;">Your Name</label>
            <input type="text" class="input" v-model="submission.name" @input="saveDraftAndRevalidate">
          </div>

          <!-- title -->
          <div class="field">
            <label class="label" :class="{ 'has-text-danger': hasError('title') }" style="font-weight: bold; text-transform: uppercase;">Your Title</label>

            <div class="control is-flex">
              <label style="cursor: pointer;">
                <input type="radio" name="title" v-model="submission.title" value="author" class="checkbox mb-3 mt-1">
                <span class="no-user-select ml-1">Author</span>
              </label>
            </div>

            <div class="control is-flex">
              <label style="cursor: pointer;">
                <input type="radio" name="title" v-model="submission.title" value="illustrator" class="checkbox mb-3 mt-1">
                <span class="no-user-select ml-1">Illustrator</span>
              </label>
            </div>

            <div class="control is-flex">
              <label style="cursor: pointer;">
                <input type="radio" name="title" v-model="submission.title" value="author-illustrator" class="checkbox mb-3 mt-1">
                <span class="no-user-select ml-1">Author/Illustrator</span>
              </label>
            </div>

          </div>

          <!-- gender -->
          <div class="field">
            <label class="label" :class="{ 'has-text-danger': hasError('gender') }" style="font-weight: bold; text-transform: uppercase;">Gender</label>

            <div class="sublabel tablet-columns-2">
              <div v-for="gender of genders" :key="gender.id" class="control is-flex" style="column-break-inside: avoid;">
                <input type="radio" name="gender" :id="`gender-${gender.id}`" v-model="submission.gender" :value="gender.id" class="checkbox mb-3 mt-1">
                <label class="label pl-2 pb-1 no-user-select" :for="`gender-${gender.id}`" style="cursor: pointer;">{{ gender.text }}</label>
              </div>
            </div>
          </div>

          <!-- bio -->
          <div class="field">
            <label class="label"><b>Bio</b></label>
            <textarea class="textarea" v-model="submission.bio" @input="saveDraftAndRevalidate" />
          </div>

          <!-- awards -->
          <div class="field">
            <label class="label"><b>List of awards and recognition that you would like us to highlight</b> (optional)</label>
            <textarea class="textarea" v-model="submission.awards" @input="saveDraftAndRevalidate" style="min-height: 6em;" />
          </div>

          <!-- bonus -->
          <div class="field">
            <label class="label"><b>Links to bonus material relevant to you</b> (optional)</label>
            <textarea class="input" v-model="submission.bonus" @input="saveDraftAndRevalidate" style="min-height: 6em;" />
          </div>

          <!-- curateInterest -->
          <div class="field">
            <label class="label"><b>Would you be in interested in curating a picture book bundle?</b> This entails listing your favorite 3-5 picture books (by other BIPOC creatives) that represent a theme of your choosing and writing a paragraph about this book collection.</label>
            <div class="control">
              <label style="cursor: pointer;">
                <input type="radio" name="curateInterest" v-model="submission.curateInterest" value="Yes" @input="saveDraftAndRevalidate">
                <span class="no-user-select ml-1">Yes! Please send me a curation form</span>
              </label>
            </div>
            <div class="control">
              <label style="cursor: pointer;">
                <input type="radio" name="curateInterest" v-model="submission.curateInterest" value="No" @input="saveDraftAndRevalidate">
                <span class="no-user-select ml-1">No</span>
              </label>
            </div>
            <div class="control">
              <label style="cursor: pointer;">
                <input type="radio" name="curateInterest" v-model="submission.curateInterest" value="Maybe" @input="saveDraftAndRevalidate">
                <span class="no-user-select ml-1">Maybe, please send me more info</span>
              </label>
            </div>
          </div>

        </section>

        <hr>

        <div class="field is-grouped">
          <button :class="{'is-loading': $uiBusy}" class="button is-rounded is-primary mr-20" @click.prevent="submitForReview">Submit for review</button>
          <button class="button is-rounded" @click.prevent="reset">Reset</button>
          <button v-if="draftSaved" class="button is-flat" @click.prevent="saveDraftAndRevalidate" style="cursor: text;">Draft Saved</button>
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

.upload-label {
  cursor: pointer;
}

.basic-information > .field {
  margin-bottom: 30px;
}

.label {
  font-size: 18px;
  font-weight: normal;
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
