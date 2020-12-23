<script>
import dayjs from 'dayjs'
import Jimp from 'jimp'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'

import MultiPersonField from '@/components/fields/MultiPerson'
import SimpleInput from '@/components/fields/SimpleInput'

export default {
  components: {
    MultiPersonField,
    SimpleInput
  },
  props: ['modelValue', 'checked'],
  emits: ['update:modelValue', 'mark-me', 'reject-me', 'approve-me', 'submitter-loaded'],
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
      return this.sub?.cover?.height / this.sub?.cover?.width * 100
    },
    coverUrl() {
      return this.sub?.cover?.url || this.sub?.cover?.base64
        ? this.sub?.cover?.base64.startsWith('data:image')
          ? this.sub?.cover?.base64
          : `data:image/png;base64,${this.sub?.cover?.base64}`
        : this.sub.thumbnail || ''
    },
    tags() {
      const tags = this.$store.getters['tags/list'].filter(tag => this.sub.tags && this.sub.tags[tag.id])
      if (!this.sub.otherTag) return tags
      return [...tags, { tag: this.sub.otherTag }]
    }
  },
  methods: {
    async reloadSub() {
      const user = await this.$store.dispatch('bookSubmissions/loadContributorProfile', this.sub.createdBy)
      user.uid = this.sub.createdBy
      this.submitter = user
      this.sub.submitter = user
      this.$emit('submitter-loaded', user)
      if (!this.sub.summary) {
        this.sub.summary = 'No summary'
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
          || !this.sub.authors
          || !this.sub.authors.length) {
        alert('Book can\'t be created without title and author')
        return
      }
      let total = 0
      let isbn = 0
      if (!this.sub.isbn || !this.sub.isbn.length) {
        warnings = [...warnings, 'ISBN is not defined']
        total++
      }
      if (!this.sub.cover || !this.sub?.cover?.base64 || !this.sub?.cover?.base64.length) {
        warnings = [...warnings, 'no book cover - upload manually or search by isbn?']
        total++
        isbn++
      }
      if (!this.sub.summary || !this.sub.summary.length || this.sub.summary === 'No summary') {
        warnings = [...warnings, 'no book summary - add manually or search by isbn?']
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
    async reject() {
      const ok = await this.$store.dispatch('ui/confirm', { header: 'Rejecting submission', text: 'Reject submission?' })
      if (!ok) return
      const comment = await this.$store.dispatch('ui/prompt', { type: 'info', header: 'Rejecting submission', text: 'Any comments on rejecting?' })
      this.sub.approveComment = comment || ''
      this.$emit('reject-me', this.sub)
    },
    save() {
      console.log('save back', this.sub)
    },
    dateFormat(date) {
      const d = dayjs(date)
      return d.format('MM-DD-YYYY')
    },
    isbnSearchState(state) {
      this.busy = state
    },
    isbnSearchResult(book) {
      console.log('isbn result', book)
      if (!book) {
        return
      }
      const src = book.google || book.openlib
      this.sub.summary = src.summary || 'No summary'
      this.sub.year = parseInt(src.publishedDate) || 0
      this.sub.publisher = src.publisher
      this.sub.goodread = book.grid || '0'
      this.sub.cover = {
        height: book.coverHeight,
        width: book.coverWidth,
      }
    },
    addAuthor() {
      // eslint-disable-next-line fp/no-mutating-methods
      this.people.push({ name: '', role: 'author' })
    },
    fileChange(e) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        Jimp.read(reader.result, (err, img) => {
          if (err) {
            console.error('jimp error', err)
          }
          if (img) {
            this.sub.cover = {
              base64: reader.result,
              height: img.bitmap.width,
              width: img.bitmap.height,
            }
          }
        })
      }
      reader.onerror = err => {
        console.error('FileReader error', err)
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

    <!-- cover -->
    <div class="column is-2 is-offset-1">
      <div class="bg-secondary cover-wrapper" :style="{'padding-top': coverRatio +'%', 'background-image': 'url('+coverUrl+')'}">
        <div v-if="busy" class="upload-icon loading">
          <i class="fas fa-spinner fa-pulse fa-fw"></i>
        </div>
        <label v-if="!busy" class="upload-icon" for="cover-upload">
          <i class="fas fa-file-upload fa-fw"></i>
        </label>
        <input @change.prevent="fileChange($event)" type="file" id="cover-upload" class="cover-file-uploader">
      </div>
    </div>

    <!-- title, authors, illustrators -->
    <div class="column is-3">

      <div style="font-weight: bold;">
        <SimpleInput
          :disabled="busy"
          :placeholder="'Title'"
          v-model="sub.title"/>
      </div>
      <div>
        <multi-person-field
          :disabled="busy"
          :role="'author'"
          :placeholder="'author(s)'"
          :search-db="false"
          pre-text="by"
          v-model="sub.authors"/>
      </div>
      <div>
        <multi-person-field
        :disabled="busy"
        :role="'illustrator'"
        :placeholder="'illustrator(s)'"
        :search-db="false"
          pre-text="illustrated by"
        v-model="sub.illustrators"/>
      </div>
      <div>
        <SimpleInput
          :disabled="busy"
          :placeholder="'Year'"
          v-model="sub.year"/>
      </div>
      <!--
      <div>
        <SimpleInput
          :disabled="busy"
          :placeholder="'ISBN'"
          v-model="sub.isbn"/>
      </div>
      <div>
        <SimpleInput
          :disabled="busy"
          :placeholder="'Publisher'"
          v-model="sub.publisher"/>
      </div>
      -->
    </div>

    <!-- tags -->
    <div class="column is-5" style="margin-top: -20px;">
      <div class="tags">
          <div v-for="(tag, tagi) of tags" :key="tagi">
            <span v-if="!tag.id" class="tag-label new" title="Tag not exists and will be created!">
              {{tag.tag}}
            </span>
            <span v-else class="tag-label">
              {{tag.tag}}
            </span>
          </div>

      </div>
      <div v-if="sub && sub.summary">
        <ckeditor :disabled="busy" class="oneline" :editor="editor" :config="ckConfig" v-model="sub.summary"/>
      </div>
    </div>

    <!-- delete -->
    <div class="column is-1 has-text-right">
      <button :class="{disabled:busy}" :disabled="busy" @click="reject()" class="is-flat is-uppercase is-underlined">
        <i class="fas fa-times" style="font-size: 20px;"></i>
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

  &.new {
    border-color: red;
  }
}
</style>
