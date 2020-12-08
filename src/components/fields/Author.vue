<script>
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon'

export default {
  props: ['modelValue', 'disabled', 'searchDb'],
  emits: ['update:modelValue', 'person-selected'],
  data() {
    return {
      person: this.modelValue || { name: '', role: 'author' },
      searches: [],
      ckeditor: BalloonEditor
    }
  },
  computed: {
    ckConfig() {
      return {
        toolbar: [],
      }
    }
  },
  created() {
    console.log(this.ckeditor)
  },
  methods: {
    toggleRole() {
      this.person.role = this.person.role === 'author' ? 'illustrator' : 'author'
    },
    doSearch(...e) {
      console.log('search', e)
      if (!this.searchDb) {
        return
      }
      const search = e.target.value.toLowerCase()
      this.$emit('update:modelValue', search)
      this.book = null
      this.searches = this.$store.state.peopleList
        .filter(person => search.length && person.name.toLowerCase().includes(search))
    },
    hideSearch() {
      this.searches = []
    },
    fillPerson(p) {
      this.hideSearch()
      this.person.name = p.name
      this.person.role = p.role
      this.$emit('update:modelValue', this.person)
      this.$emit('person-selected', p)
    },
    onEnter(e) {
      console.log('eeeee!', e)
    }
  },
  watch: {
    modelValue(next, prev) {
      this.person = next
    }
  }
}
</script>

<template>

<div class="control">
  <div class="field is-grouped">
    <div class="control">
      <button @click.prevent="toggleRole()" class="is-flat">
        <i v-if="person.role === 'author'" class="fas fa-pencil-alt"></i>
        <i v-if="person.role === 'illustrator'" class="fas fa-palette"></i>
      </button>
    </div>
    <div class="control">
      <ckeditor
        class="oneline"
        v-model="person.name"
        :editor="ckeditor"
        :config="ckConfig"
        @input="doSearch"
      />
      <div v-click-outside="hideSearch" v-if="searches.length" class="search-wrap">
        <div class="search-results">
          <div @click.prevent="fillPerson(res)" class="media p-2" v-for="res of searches" :key="res.id">
            <b>{{res.name}}</b><br>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

</template>

<style lang="scss" scoped>

.search-wrap {
  position: relative;
  .search-results {
    position: absolute;
    width: 100%;
    max-height: 400px;
    overflow-y: scroll;
    left: 0;
    top: 0;
    z-index: 5;
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
