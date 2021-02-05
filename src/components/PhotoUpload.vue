<script>

export default {
  props: {
    labelClass: String,
    labelStyle: String,
    modelValue: {
      required: true,
    },
    noremove: Boolean,
    // TODO: fix dynamic height and remove photoHeight
    photoHeight: String,
  },
  emits: ['update:modelValue'],
  methods: {

    fileChange(e) {

      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = () => {
        const photo = {
          base64: reader.result
        }

        // load width and height
        const image = new Image()
        image.onload = function() {
          photo.width = this.width
          photo.height = this.height
        }
        image.src = reader.result

        this.$emit('update:modelValue', photo)
      }
      reader.onerror = err => {
        console.error('FileReader error', err)
      }
      reader.readAsDataURL(file)
    },

    clearPhoto() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
      this.$emit('update:modelValue', null)
    },

  }
}
</script>

<template>

  <div>

    <div class="photo-circle mb-1" style="position: relative; height: 100%;">
      <!-- TODO: preserve aspect ratio with dynamic width and height. min-height is currently a magic number to keep a square aspect ratio. -->
      <div :class="{ 'bg-secondary': !modelValue, 'has-photo': modelValue }" class="photo-container is-flex is-justify-content-center is-align-items-center" style="border-radius: 999px; position: relative; cursor: pointer; height: 100%;" :style="{ minHeight: photoHeight || '168px' }">
        <div class="photo" v-if="modelValue" :style="{
          width: '100%',
          height: photoHeight || '100%',
          borderRadius: '999px',
          backgroundImage: `url(${modelValue.base64})`,
          backgroundSize: 'cover',
          backgroundPosition: '50%',
        }" />
        <label for="photo-field" class="has-text-centered" style="cursor: pointer; font-weight: bold; position: absolute;">{{ modelValue ? 'CHANGE' : 'UPLOAD' }}<br>PHOTO</label>
      </div>

      <input id="photo-field" ref="fileInput" type="file" @change="fileChange($event)" style="position: absolute; height: 100%; width: 100%; cursor: pointer; top: 0; opacity: 0; border-radius: 999px;">
    </div>

    <template v-if="!noremove">
      <div class="has-text-centered">
        <a :class="{ 'is-invisible': !modelValue }" @click.prevent="clearPhoto">Remove photo</a>
      </div>

      <div v-if="!modelValue || modelValue.width < 750" class="is-flex is-justify-content-center" :style="!modelValue ? { marginTop: '-1.2em' } : null">
        <p :class="{ 'has-text-danger': modelValue?.width < 750 }" style="position: absolute;">Minimum size: 800x800px</p>
      </div>
    </template>

  </div>

</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/style/vars.scss';
@import '@/assets/style/mixins.scss';

.photo-container {

  label {
    .photo-circle:hover & {
      @include primary(color);
    }
  }

  &.has-photo {

    .photo {
      .photo-circle:hover & {
        color: white;
        opacity: 0.5;
      }
    }

    label {
      color: black;
      visibility: hidden;
      .photo-circle:hover & {
        color: black !important;
        visibility: visible;
      }
    }
  }

}

a {
  color: black;
  &:hover {
    @include primary(color);
  }
}

</style>
