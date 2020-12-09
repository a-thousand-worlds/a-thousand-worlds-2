<script>
import dayjs from 'dayjs'
import Jimp from 'jimp'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'

import AuthorField from '@/components/fields/Author'
import IsbnField from '@/components/fields/Isbn'

export default {
  components: {
    AuthorField,
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
    const authors = this.sub.author.split(',')
      .map(name => name.trim())
      .map(name => ({ role: 'author', name }))
    const illustrators = this.sub.illustrator.split(',')
      .map(name => name.trim())
      .map(name => ({ role: 'illustrator', name }))
    this.people = [...authors, ...illustrators]
      .filter(x => x !== '')
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
    canAddAuthor() {
      return this.people.reduce((acc, author) => !author.name.length ? false : acc, true)
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
    save() {

    },
    remove() {

    },
    approve() {
      console.log('approve', this.sub, this.people)
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
      console.log(this.sub.title)
      if (this.sub.title.startsWith('<p>') && this.sub.title.endsWith('</p>')) {
        this.sub.title = this.sub.title.slice(3, -4)
      }
      console.log(this.sub.title)
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
        <label class="upload-icon" for="cover-upload">
          <i class="fas fa-file-upload"></i>
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
          @isbn-search-state="isbnSearchState"
          @isbn-search-result="isbnSearchResult"
        />
      </div>
      <div v-for="(person, i) of people" :key="i">
        <author-field :disabled="busy" :searchDb="true" v-model="people[i]"/>
      </div>
      <div v-if="canAddAuthor">
        <button @click="addAuthor()" :disabled="busy" class="is-flat">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>
    <div class="column is-2" style="text-align:justify">
      <ckeditor :disabled="busy" class="oneline" :editor="editor" :config="ckConfig" v-model="sub.description"/>
    </div>
    <div class="column is-2">
      <div class="field is-grouped">
        <div class="control">
          <button @click="remove()" class="is-flat is-uppercase is-underlined">
            Delete
          </button>
        </div>
        <div class="control">
          <button @click="approve()" class="is-flat is-uppercase is-underlined">
            Approve
          </button>
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

.font-mono {
  font-family: $family-mono;
}

input[type="checkbox"] {
  width: 25px;
  height: 25px;
}

.cover-wrapper {
  width: 100%;
  background-size: cover;
  position: relative;

  .upload-icon {
    position: absolute;
    top: calc(50% - 2.0rem);
    left: calc(50% - 0.9rem);
    font-size: 3rem;
    display: none;
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

</style>
