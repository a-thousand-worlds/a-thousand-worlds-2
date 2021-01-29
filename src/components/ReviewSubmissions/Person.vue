<script>
import _ from 'lodash'
import Jimp from 'jimp'
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'
import PhotoUpload from '@/components/PhotoUpload'
import SimpleInput from '@/components/fields/SimpleInput'
import Tag from '@/components/Tag'
import almostEqual from '@/util/almostEqual'

export default {
  components: {
    PhotoUpload,
    SimpleInput,
    Tag,
  },
  props: ['submission', 'modelValue', 'checked'],
  data() {
    return {
      busy: false,
      editor: BalloonEditor,
      image: null,
      photo: this.user?.profile.photo,
      sub: this.submission || {},
    }
  },
  computed: {
    ckConfig() {
      return {
        toolbar: [],
        placeholder: 'No bio'
      }
    },
    identities() {
      return Object.keys(this.sub?.identities || {})
    },
    peopleTags() {
      return this.$store.state.tags.people.data
    },
    /** Gets the person with an almost equal name. */
    person() {
      if (!this.sub) return null
      return this.$store.getters['people/findBy'](person => almostEqual(person.name, this.sub.name))
    },
    /** If there is a matching person, get their books. */
    books() {
      if (!this.person) return null
      return this.$store.getters['books/list']().filter(book =>
        Object.keys(book.creators || {}).includes(this.person.id)
      )
    },
    /** Gets the user that createtd the submission. */
    user() {
      return this.$store.state.users.data?.[this.sub?.createdBy]
    },
  },
  watch: {
    submission(next) {
      this.sub = next
    },
    user(next) {
      if (next?.profile.photo) {
        this.photo = next.profile.photo
      }
    },
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
            this.sub.photo = {
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
        <PhotoUpload v-model="photo" photoHeight="88px" noremove />
      </div>

      <!-- name -->
      <div class="column is-3">

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

        <Tag v-if="!person" :tag="{ tag: 'NEW' }" nolink class="mt-1" v-tippy="{ content: 'This person is new! When they are approved, they will be added to the people directory but they won\'t have any books.' }" />
        <div v-else>{{ books.length }} book{{ books.length === 1 ?'' : 's' }}</div>
      </div>

      <div class="column is-5">
        <!-- bio -->
        <div>
          <ckeditor @update:modelValue="save" v-model="sub.bio" :disabled="busy" class="oneline" :editor="editor" :config="ckConfig" style="padding: 0;" />
        </div>
        <!-- identities -->
        <div class="tags">
          <Tag v-for="id of identities" :key="id" :tag="peopleTags[id]" type="people" linkToManager class="mr-1 mb-1" v-tippy="{ content: 'Edit people tags' }" />
        </div>
      </div>

      <!-- reject -->
      <div v-if="sub?.status !== 'rejected'" class="column is-1 has-text-right">
        <button :class="{ disabled: busy }" :disabled="busy" v-tippy="{ content: 'Reject submission' }" class="is-flat is-uppercase is-underlined" @click="reject">
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
