<script>
import _ from 'lodash'
import validator from '@/mixins/validator'
import Toggle from '@/components/Toggle'

export default {
  components: {
    Toggle,
  },
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
      genderOptions: [
        'Trans Woman',
        'Trans Man',
        'Non-Binary',
        'Gender Non-Conforming',
        'Genderqueer',
        'Genderfluid',
        'Agender',
        'Queer',
      ],
      identityOptions: [
        'Black',
        'Indigenous',
        'Latin X',
        'Asian',
        'Native Hawaiian/Pacific Islander',
        'Arab, Middle Eastern, North African',
        'Biracial/Multiracial',
        'LGBTQIA+',
        'Neurodiverse',
        'Physical diverse',
        'Sensory diverse',
      ],
      submission: this.newSubmission(),
    }
  },
  computed: {
    name() {
      return this.$store.state.user.user?.profile.name
    }
  },
  created() {
    this.submission = {
      ...this.newSubmission(),
      ...this.$store.state.user.user?.profile.draftPerson
    }
  },
  methods: {

    clear() {
      this.submission = this.newSubmission()
      this.errors = []
      this.clearDraft()
    },

    clearDraft() {
      this.$store.dispatch('user/savePersonSubmissionDraft', [])
      clearTimeout(this.draftSaved)
      this.draftSaved = null
    },

    newSubmission() {
      return {
        awards: '',
        bio: '',
        bonus: '',
        curateInterest: '',
        gender: '',
        identities: {},
        name: this.name,
        pronoun: '',
        title: 'Author',
        website: ''
      }
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
      await this.$store.dispatch('submissions/people/submit', this.submission)
      this.$store.commit('ui/setBusy', false)
      this.$router.push({ name: 'SubmissionThankYou', params: { type: 'people' } })
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

          <!-- name -->
          <div class="field">
            <label class="label" :class="{ 'has-text-danger': hasError('name') }" style="font-weight: bold; text-transform: uppercase;">Your Name</label>
            <input type="text" class="input" v-model="submission.name" @input="revalidate">
          </div>

          <!-- title -->
          <div class="field">
            <label class="label" :class="{ 'has-text-danger': hasError('title') }" style="font-weight: bold; text-transform: uppercase;">Your Title</label>
            <div class="control">
              <label style="cursor: pointer;">
                <input type="radio" name="title" v-model="submission.title" value="Author" checked>
                Author
              </label>
            </div>
            <div class="control">
              <label style="cursor: pointer;">
                <input type="radio" name="title" v-model="submission.title" value="Illustrator">
                Illustrator
              </label>
            </div>
            <div class="control">
              <label style="cursor: pointer;">
                <input type="radio" name="title" v-model="submission.title" value="Author/Illustrattor">
                Author/Illustrator
              </label>
            </div>
          </div>

          <!-- gender -->
          <div class="field">
            <label class="label" :class="{ 'has-text-danger': hasError('gender') }" style="font-weight: bold; text-transform: uppercase;">Gender</label>

            <!-- basic genders (M/W) -->
            <div class="sublabel">
              <div class="control is-flex">
                <input type="radio" name="gender" id="gender-woman" value="Woman" class="checkbox mb-3 mt-1">
                <label class="label pl-2 pb-1" for="gender-woman" style="cursor: pointer;">Woman</label>
              </div>
              <div class="control is-flex">
                <input type="radio" name="gender" id="gender-man" value="Man" class="checkbox mb-3 mt-1">
                <label class="label pl-2 pb-1" for="gender-man" style="cursor: pointer;">Man</label>
              </div>
            </div>

            <!-- more genders -->
            <Toggle>
              <template #label>More</template>
              <template #content>
                <div class="sublabel tablet-columns-2 m-10">
                  <div v-for="(gender, i) of genderOptions" :key="gender" class="control is-flex" style="column-break-inside: avoid;">
                    <input type="radio" name="gender" :id="`gender${i}`" :value="submission.gender" class="checkbox mb-3 mt-1">
                    <label class="label pl-2 pb-1" :for="`gender${i}`" style="cursor: pointer;">{{ gender }}</label>
                  </div>
                </div>
              </template>
            </Toggle>
          </div>

          <!-- identity -->
          <div class="field">
            <label class="label" :class="{ 'has-text-danger': hasError('identities') }" style="font-weight: bold; text-transform: uppercase;">Identity</label>
            <div class="sublabel tablet-columns-2">
              <div v-for="(identity, i) of identityOptions" :key="identity" class="control is-flex" style="column-break-inside: avoid;">
                <input v-model="submission.identities[identity]" :id="`identity${i}`" type="checkbox" class="checkbox mb-3 mt-1" @input="revalidate">
                <label class="label pl-2 pb-1" :for="`identity${i}`" style="cursor: pointer;">{{ identity }}</label>
              </div>
            </div>
          </div>

          <!-- rewards -->
          <div class="field">
            <label class="label"><b>List of awards and recognition that you would like us to highlight</b> (optional)</label>
            <input type="text" class="input" v-model="submission.rewards">
          </div>

          <!-- bonus -->
          <div class="field">
            <label class="label"><b>Links to bonus material relevant to you</b> (optional)</label>
            <input type="text" class="input" v-model="submission.bonus">
          </div>

          <!-- curateInterest -->
          <div class="field">
            <label class="label"><b>Would you be in interested in curating a picture book bundle?</b> This entails listing your favorite 3-5 picture books (by other BIPOC creatives) that represent a theme of your choosing and writing a paragraph about this book collection.</label>
            <div class="control">
              <label style="cursor: pointer;">
                <input type="radio" name="title" v-model="submission.curateInterest" value="Yes">
                Yes! Please send me a curation form
              </label>
            </div>
            <div class="control">
              <label style="cursor: pointer;">
                <input type="radio" name="title" v-model="submission.curateInterest" value="No">
                No
              </label>
            </div>
            <div class="control">
              <label style="cursor: pointer;">
                <input type="radio" name="title" v-model="submission.curateInterest" value="Maybe">
                Maybe, please send me more info
              </label>
            </div>
          </div>

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

.sublabel .label {
  font-size: 14px;
}

.basic-information > .field {
  margin-bottom: 30px;
}

.label {
  font-size: 18px;
  font-weight: normal;
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
