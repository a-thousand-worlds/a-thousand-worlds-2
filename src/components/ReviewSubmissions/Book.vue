<script>
import _ from 'lodash'
import Jimp from 'jimp'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'
import MultiPersonField from '@/components/fields/MultiPerson'
import SimpleInput from '@/components/fields/SimpleInput'

export default {
  components: {
    MultiPersonField,
    SimpleInput,
  },
  props: ['submission', 'modelValue', 'checked'],
  data() {
    return {
      busy: false,
      ckConfig: {
        toolbar: [],
        placeholder: 'No summary'
      },
      sub: this.submission || {},
      editor: BalloonEditor,
      // selected: this.checked || false,
      // submitter: {},
      cover: null,
      people: []
    }
  },
  computed: {
    coverRatio() {
      return this.sub.cover?.height / this.sub.cover?.width * 100 || 100
    },
    coverUrl() {
      return this.sub.thumbnail?.startsWith('http')
        ? this.sub.thumbnail
        : this.sub.cover?.url.startsWith('http')
          ? this.sub.cover?.url
          : this.sub.cover?.base64
            ? this.sub.cover?.base64.startsWith('data:image')
              ? this.sub.cover?.base64
              : `data:image/png;base64,${this.sub.cover.base64}`
            : ''
    },
    tags() {
      const tags = this.$store.getters['tags/books/listSorted']()
        .filter(tag => this.sub.tags && this.sub.tags[tag.id])
      if (!this.sub.otherTag) return tags
      return [...tags, { tag: this.sub.otherTag }]
    }
  },
  watch: {
    submission(next) {
      this.sub = next
    }
  },
  methods: {
    async reject() {
      await this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch('submissions/books/reject', this.sub)
      await this.$store.commit('ui/setBusy', false)
      this.$store.dispatch('ui/popup', 'Book rejected')
    },
    save: _.debounce(async function() {
      await this.$store.dispatch('submissions/books/save', {
        path: this.sub.id,
        value: { ...this.sub }
      })
    }, 500),
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
            this.save()
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
            <i class="fas fa-spinner fa-pulse fa-fw" />
          </div>
          <label v-if="!busy" class="upload-icon" for="cover-upload">
            <i class="fas fa-file-upload fa-fw" />
          </label>
          <input id="cover-upload" type="file" class="cover-file-uploader" @change.prevent="fileChange($event)">
        </div>
      </div>

      <!-- title, authors, illustrators -->
      <div class="column is-3">

        <div style="font-weight: bold;">
          <SimpleInput
            v-model="sub.title"
            @update:modelValue="save()"
            :disabled="busy"
            :placeholder="'Title'" />
        </div>
        <div>
          <MultiPersonField
            v-model="sub.authors"
            @update:modelValue="save()"
            :disabled="busy"
            :role="'author'"
            :placeholder="'author(s)'"
            :search-db="false"
            pre-text="words by" />
        </div>
        <div>
          <MultiPersonField
            v-model="sub.illustrators"
            @update:modelValue="save()"
            :disabled="busy"
            :role="'illustrator'"
            :placeholder="'illustrator(s)'"
            :search-db="false"
            pre-text="illustrated by" />
        </div>
        <div>
          <SimpleInput
            v-model="sub.year"
            @update:modelValue="save()"
            :disabled="busy"
            :placeholder="'Year'" />
        </div>
      <!--
      <div>
        <SimpleInput
          :disabled="busy"
          :placeholder="'ISBN'"
            @update:modelValue="save()"
          v-model="sub.isbn"/>
      </div>
      <div>
        <SimpleInput
          :disabled="busy"
          :placeholder="'Publisher'"
            @update:modelValue="save()"
          v-model="sub.publisher"/>
      </div>
      -->
      </div>

      <div class="column is-5" style="margin-top: -20px;">
        <!-- summary -->
        <div>
          <ckeditor @update:modelValue="save()" v-model="sub.summary" :disabled="busy" class="oneline" :editor="editor" :config="ckConfig" style="padding: 0;" />
        </div>
        <!-- tags -->
        <div class="tags">
          <div v-for="(tag, tagi) of tags" :key="tagi" class="button is-primary is-rounded is-mini mr-1 mb-1" style="cursor: default;">{{ tag.tag }}</div>
        </div>
      </div>

      <!-- reject -->
      <div v-if="sub?.status !== 'rejected'" class="column is-1 has-text-right">
        <button :class="{disabled:busy}" :disabled="busy" class="is-flat is-uppercase is-underlined" @click="reject()">
          <i class="fas fa-times" style="font-size: 20px;" />
        </button>
      </div>
    </div>
  </div>

</template>

<style lang="scss" scoped>
@import '@/assets/style/vars.scss';
.container {
  padding-top: 2rem;
  margin-top: 2rem;
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
