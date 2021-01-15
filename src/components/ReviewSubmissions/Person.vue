<script>
import _ from 'lodash'
import Jimp from 'jimp'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'

import SimpleInput from '@/components/fields/SimpleInput'

export default {
  components: {
    SimpleInput,
  },
  props: ['submission', 'modelValue', 'checked'],
  data() {
    return {
      busy: false,
      sub: this.submission || {},
      editor: BalloonEditor,
      image: null,
    }
  },
  computed: {
    ckConfig() {
      return {
        toolbar: [],
        placeholder: 'No bio'
      }
    },
    imageRatio() {
      return this.sub.image?.height / this.sub.image?.width * 100 || 100
    },
    imageUrl() {
      return this.sub.thumbnail?.startsWith('http')
        ? this.sub.thumbnail
        : this.sub.image?.url.startsWith('http')
          ? this.sub.image?.url
          : this.sub.image?.base64
            ? this.sub.image?.base64.startsWith('data:image')
              ? this.sub.image?.base64
              : `data:image/png;base64,${this.sub.image.base64}`
            : ''
    },
    identities() {
      return Object.keys(this.sub?.identities || {})
    }
  },
  watch: {
    submission(next) {
      this.sub = next
    }
  },
  methods: {

    async reject() {
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch('submissions/people/reject', this.sub)
      this.$store.commit('ui/setBusy', false)
      this.$store.dispatch('ui/popup', 'Person submission rejected')
    },

    save: _.debounce(async function() {
      await this.$store.dispatch('submissions/people/save', {
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
            this.sub.image = {
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

      <!-- image -->
      <div class="column is-2 is-offset-1">
        <div class="bg-secondary image-wrapper" :style="{'padding-top': imageRatio +'%', 'background-image': 'url('+imageUrl+')'}">
          <div v-if="busy" class="upload-icon loading">
            <i class="fas fa-spinner fa-pulse fa-fw" />
          </div>
          <label v-if="!busy" class="upload-icon" for="image-upload">
            <i class="fas fa-file-upload fa-fw" />
          </label>
          <input id="image-upload" type="file" class="image-file-uploader" @change.prevent="fileChange($event)">
        </div>
      </div>

      <!-- name -->
      <div class="column is-3">

        <div>
          <SimpleInput
            v-model="sub.name"
            @update:modelValue="save"
            :disabled="busy"
            style="font-weight: bold;"
            placeholder="Name"
          />
          <SimpleInput
            v-model="sub.title"
            @update:modelValue="save"
            :disabled="busy"
            placeholder="Title"
          />
        </div>
      </div>

      <div class="column is-5">
        <!-- bio -->
        <div>
          <ckeditor @update:modelValue="save" v-model="sub.bio" :disabled="busy" class="oneline" :editor="editor" :config="ckConfig" style="padding: 0;" />
        </div>
        <!-- identities -->
        <div class="tags">
          <div v-for="identity of identities" :key="identity" class="button is-primary is-rounded is-mini mr-1 mb-1" style="cursor: default;">{{ identity }}</div>
        </div>
      </div>

      <!-- reject -->
      <div class="column is-1 has-text-right">
        <button :class="{ disabled: busy }" :disabled="busy" title="Reject submission" class="is-flat is-uppercase is-underlined" @click="reject">
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

input[type="checkbox"] {
  width: 25px;
  height: 25px;
}

.image-wrapper {
  width: 100%;
  background-size: image;
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

#image-upload {
  display: none;
}

</style>
