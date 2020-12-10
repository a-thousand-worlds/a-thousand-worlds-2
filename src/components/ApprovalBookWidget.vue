<script>
import dayjs from 'dayjs'
import Jimp from 'jimp'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'

import AuthorField from '@/components/fields/Author'
import MultiPersonField from '@/components/fields/MultiPerson'
import IsbnField from '@/components/fields/Isbn'

export default {
  components: {
    AuthorField,
    MultiPersonField,
    IsbnField
  },
  props: ['modelValue', 'checked'],
  emits: ['update:modelValue', 'oncheck'],
  data() {
    return {
      busy: false,
      sub: this.modelValue || {},
      editor: BalloonEditor,
      selected: this.checked || false,
      submitter: {},
      cover: null,
      people: []
    }
  },
  created() {
    // console.log('approve book', this.sub)
    /*
    const authors = this.sub.author.split(',')
      .map(name => name.trim())
      .map(name => ({ role: 'author', name }))
    const illustrators = this.sub.illustrator.split(',')
      .map(name => name.trim())
      .map(name => ({ role: 'illustrator', name }))
    this.people = [...authors, ...illustrators]
      .filter(x => x !== '')
    */
    this.$store.dispatch('loadContributorProfile', this.sub.createdBy)
      .then(user => {
        this.submitter = user
        // console.log('submitter', user)
      })
    if (!this.sub.description) {
      this.sub.description = 'No summary'
    }
    if (!this.sub.cover) {
      this.sub.cover = {
        url: '',
        base64: '',
        loaded: false,
        width: 1,
        height: 1
      }
    }
  },
  watch: {
    selected(next) {
      console.log('selected next', next)
    }
  },
  computed: {
    ckConfig() {
      return {
        toolbar: []
      }
    },
    coverRatio() {
      return this.sub.cover.height / this.sub.cover.width * 100
    },
    coverBg() {
      return '#ddd'
    },
    coverUrl() {
      return this.sub.cover.url.length ? this.sub.cover.url : this.sub.cover.base64.length ? this.sub.cover.base64.startsWith('data:image') ? this.sub.cover.base64 : `data:image/png;base64,${this.sub.cover.base64}` : ''
    }
  },
  methods: {
    approve() {
      let warnings = []
      if (!this.sub.title
          || !this.sub.title.length
          || !this.sub.author
          || !this.sub.author.length) {
        alert('Book can\'t be created without title and author')
        return
      }
      if (!this.sub.isbn || !this.sub.isbn.length) {
        warnings = [...warnings, 'ISBN is not defined']
      }
      if (!this.sub.cover || !this.sub.cover.base64 || !this.sub.cover.base64.length) {
        warnings = [...warnings, 'no book cover - upload manually or search by isbn?']
      }
      if (!this.sub.description || !this.sub.description.length) {
        warnings = [...warnings, 'no book description - add manually or search by isbn?']
      }
      if (!Object.keys(this.sub.tags) || (this.sub.tags.other && !this.sub.otherTag.length)) {
        warnings = [...warnings, 'book is not categorized - you can add tags manually']
      }
      if (warnings.length) {
        if (confirm('Warnings:\r' + warnings.join('\r') + '\r\rCreate book?')) {
          console.log('do approve', this.sub)
        }
      }
      else {
        console.log('do approve', this.sub)
      }
    },
    remove() {
      if (confirm(`Delete book suggestion <${this.sub.title}>?`)) {
        console.log('removing sub', this.sub.id)
      }
    },
    save() {
      console.log('save back', this.sub)
    },
    dateFormat(date) {
      const d = dayjs(date)
      return d.format('MM-DD-YYYY')
    },
    isbnSearchState(state) {
      // console.log('isbn state', state)
      this.busy = state
    },
    isbnSearchResult(book) {
      console.log('isbn result', book)
      if (!book) {
        return
      }
      this.sub.description = book.google && book.google.description ? book.google.description : book.openlib && book.openlib.description ? book.openlib.description : 'No summary'
      this.sub.cover.width = book.coverWidth
      this.sub.cover.height = book.coverHeight
      this.sub.cover.base64 = book.cover
    },
    addAuthor() {
      // eslint-disable-next-line fp/no-mutating-methods
      this.people.push({ name: '', role: 'author' })
    },
    setTitle() {
      /*
      console.log(this.sub.title)
      if (this.sub.title.startsWith('<p>') && this.sub.title.endsWith('</p>')) {
        this.sub.title = this.sub.title.slice(3, -4)
      }
      console.log(this.sub.title)
      */
    },
    fileChange(e) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        console.log('readed', reader.result)
        Jimp.read(reader.result, (err, img) => {
          if (err) {
            console.log('jimp error', err)
          }
          if (img) {
            this.sub.cover.base64 = reader.result
            this.sub.cover.width = img.bitmap.width
            this.sub.cover.height = img.bitmap.height
          }
        })
      }
      reader.onerror = err => {
        console.log('rreader error', err)
      }
      reader.readAsDataURL(file)
    }
  }
}
</script>

<template>
<div class="container">
  <div class="columns">
    <div class="column is-1">
      <input :disabled="busy" type="checkbox" v-model="selected" @click="toggleCheck()"/>
    </div>
    <div class="column is-2">
      <h3 class="title">BOOK</h3>
      <div class="createdAt font-mono">{{dateFormat(sub.createdAt)}}</div>
      <div class="createdBy font-mono">{{submitter.firstName}} {{submitter.lastName}}</div>
    </div>
    <div class="column is-2">
      <div class="cover-wrapper" :style="{'padding-top': coverRatio +'%', 'background-color': coverBg, 'background-image': 'url('+coverUrl+')'}">
        <div v-if="busy" class="upload-icon loading">
          <i class="fas fa-spinner fa-pulse fa-fw"></i>
        </div>
        <label v-if="!busy" class="upload-icon" for="cover-upload">
          <i class="fas fa-file-upload fa-fw"></i>
        </label>
        <input @change.prevent="fileChange($event)" type="file" id="cover-upload" class="cover-file-uploader">
      </div>
    </div>
    <div class="column is-3">
      <h3 class="title">
        <ckeditor :disabled="busy" @blur="setTitle()" class="oneline" :editor="editor" :config="ckConfig" v-model="sub.title"/>
      </h3>
      <div>
        <isbn-field
          v-model="sub.isbn"
          :searchDb="true"
          :disabled="busy"
          @isbn-search-state="isbnSearchState"
          @isbn-search-result="isbnSearchResult"
        />
      </div>
      <div>
        <multi-person-field :disabled="busy" :role="'author'" :search-db="false" v-model="sub.author"/>
      </div>
      <div>
        <multi-person-field :disabled="busy" :role="'illustrator'" :search-db="false" v-model="sub.illustrator"/>
      </div>
      <div v-for="(person, i) of people" :key="i">
        <author-field :disabled="busy" :searchDb="true" v-model="people[i]"/>
      </div>
    </div>
    <div class="column is-2" style="text-align:justify">
      <ckeditor :disabled="busy" class="oneline" :editor="editor" :config="ckConfig" v-model="sub.description"/>
    </div>
    <div class="column is-2">
      <div class="field is-grouped">
        <div class="control">
          <button :class="{disabled:busy}" :disabled="busy" @click="remove()" class="is-flat is-uppercase is-underlined">
            Delete
          </button>
        </div>
        <div class="control">
          <button :class="{disabled:busy}" :disabled="busy" @click="approve()" class="is-flat is-uppercase is-underlined">
            Approve
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="columns">
    <div class="column is-7 is-offset-3">

      <div class="field">
        <label class="label">Categories</label>
        <div class="columns2">

          <div v-for="tag of $store.state.sortedTags" :key="tag.id" class="control">
            <input :disabled="busy" :id="tag.id" :name="tag.id" type="checkbox" class="checkbox mr-3" v-model="sub.tags[tag.id]">
            <label :class="{disabled:busy}" class="label is-inline" :for="tag.id">
              {{tag.tag}} <i v-if="tag.showOnFront" class="fas fa-check has-text-primary ml-1"></i>
            </label>
          </div>

          <div class="control">
            <input :disabled="busy" id="otherTagCheckbox" type="checkbox" class="checkbox mr-3" v-model="sub.tags.other">
            <label :class="{disabled:busy}" class="label is-inline" for="otherTagCheckbox">
              Other
            </label>
            <input :disabled="busy || !sub.tags.other" type="text" class="input is-inline"  v-model="sub.otherTag"/>
          </div>

        </div>
      </div>

    </div>
  </div>
</div>
</template>

<style lang="scss" scoped>
@import '@/assets/main.scss';
.container {
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid $atw-base;
}

h3.title {
  font-size: 110%;
}

input[type="checkbox"] {
  width: 25px;
  height: 25px;
}

.ck-read-only {
  color: #aaa;
}

.cover-wrapper {
  width: 100%;
  background-size: cover;
  position: relative;

  .upload-icon {
    position: absolute;
    top: calc(50% - 36px);
    left: calc(50% - 30px);
    font-size: 3rem;
    display: none;

    &.loading {
      display: block;
    }
  }

  &:hover {
    .upload-icon {
      display: block;
      cursor: pointer;
    }
  }

}

#cover-upload {
  display: none;
}

.columns2 {
  column-count: 2;

  .label {
    position: relative;
    top: -7px;
  }

  .input.is-inline {
    margin-top: -7px;
  }
}

</style>
