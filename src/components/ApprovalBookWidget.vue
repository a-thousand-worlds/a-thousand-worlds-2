<script>
import dayjs from 'dayjs'
import Jimp from 'jimp'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'

import MultiPersonField from '@/components/fields/MultiPerson'
import IsbnField from '@/components/fields/Isbn'
import InputField from '@/components/fields/SimpleInput'

export default {
  components: {
    MultiPersonField,
    IsbnField,
    InputField
  },
  props: ['modelValue', 'checked'],
  emits: ['update:modelValue', 'mark-me', 'delete-me', 'approve-me', 'submitter-loaded'],
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
    // console.log('sub?', this.sub)
    this.reloadSub()
  },
  watch: {
    selected(next) {
      this.$emit('mark-me', { ...this.sub, mark: next })
    },
    modelValue(next) {
      this.sub = next
      this.reloadSub()
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
    },
    tags() {
      if (!this.$store.state.sortedTags) {
        return []
      }
      return this.$store.state.sortedTags.filter(tag => this.sub.tags && this.sub.tags[tag.id])
    }
  },
  methods: {
    reloadSub() {
      this.$store.dispatch('loadContributorProfile', this.sub.createdBy)
        .then(user => {
          user.uid = this.sub.createdBy
          this.submitter = user
          this.sub.submitter = user
          this.$emit('submitter-loaded', user)
          console.log('submitter', user)
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
    approve() {
      let warnings = []
      if (!this.sub.title
          || !this.sub.title.length
          || !this.sub.author
          || !this.sub.author.length) {
        alert('Book can\'t be created without title and author')
        return
      }
      let total = 0
      let isbn = 0
      if (!this.sub.isbn || !this.sub.isbn.length) {
        warnings = [...warnings, 'ISBN is not defined']
        total++
      }
      if (!this.sub.cover || !this.sub.cover.base64 || !this.sub.cover.base64.length) {
        warnings = [...warnings, 'no book cover - upload manually or search by isbn?']
        total++
        isbn++
      }
      if (!this.sub.description || !this.sub.description.length || this.sub.description === 'No summary') {
        warnings = [...warnings, 'no book description - add manually or search by isbn?']
        total++
        isbn++
      }
      if (!Object.keys(this.sub.tags) || (this.sub.tags.other && !this.sub.otherTag.length)) {
        warnings = [...warnings, 'book is not categorized - you can add tags manually']
        total++
      }
      const isbnable = total === isbn ? 'All warnigns can be resolved by isbn search' : ''
      if (warnings.length) {
        const warn = `Warnings:
  ${warnings.join('\r\t')}
${isbnable}
Continue and create book?`
        if (confirm(warn)) {
          this.$emit('approve-me', this.sub)
        }
      }
      else {
        this.$emit('approve-me', this.sub)
      }
    },
    remove() {
      if (confirm(`Delete book suggestion <${this.sub.title}>?`)) {
        this.$emit('delete-me', this.sub)
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
      const src = book.google || book.openlib
      this.sub.description = src.description || 'No summary'
      this.sub.year = parseInt(src.publishedDate) || 0
      this.sub.publisher = src.publisher
      this.sub.goodreadId = book.grid || '0'
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
    <!--
    <div class="column is-1">
      <input :disabled="busy" type="checkbox" v-model="selected"/>
    </div>
    -->
    <div class="column is-3 is-offset-1">

      <div>
        <input-field
          :disabled="busy"
          v-model="sub.title"/>
      </div>
      <div>
        <multi-person-field :disabled="busy" :role="'author'" :search-db="false" v-model="sub.author"/>
      </div>
      <div>
        <multi-person-field :disabled="busy" :role="'illustrator'" :search-db="false" v-model="sub.illustrator"/>
      </div>
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
        <input-field
          :disabled="busy"
          v-model="sub.year"/>
      </div>
      <div>
        <input-field
          :disabled="busy"
          v-model="sub.publisher"/>
      </div>
    </div>

    <div class="column is-5">
      <div class="tags">

          <div v-for="tag of tags" :key="tag.id">
            <span class="tag-label">
              {{tag.tag}}
            </span>
          </div>

      </div>
      <ckeditor :disabled="busy" class="oneline" :editor="editor" :config="ckConfig" v-model="sub.description"/>
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
    <div class="column is-1">
      <button :class="{disabled:busy}" :disabled="busy" @click="remove()" class="is-flat is-uppercase is-underlined">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</div>
</template>

<style lang="scss" scoped>
@import '@/assets/main.scss';
.container {
  padding-top: 2rem;
  margin-top: 2rem;
  // border-top: 1px solid $atw-base;
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

.tag-label {
  padding: 5px;
  border-radius: 15px;
  margin-right: 10px;
  border: 1px solid $atw-base;
  line-height: 20px;
}
</style>
