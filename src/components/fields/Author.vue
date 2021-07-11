<script>
export default {
  props: ['modelValue', 'disabled', 'searchDb'],
  emits: ['update:modelValue', 'person-selected'],
  data() {
    return {
      person: this.modelValue || { name: '', role: 'author' },
      searches: [],
      mode: 'view',
    }
  },
  computed: {
    ckConfig() {
      return {
        toolbar: [],
      }
    },
  },
  watch: {
    modelValue(next, prev) {
      this.person = next
    },
  },
  created() {
    console.log(this.ckeditor)
  },
  methods: {
    toggleRole() {
      this.person.role = this.person.role === 'author' ? 'illustrator' : 'author'
    },
    doSearch(e) {
      if (!this.searchDb) {
        return
      }
      const search = e.target.value.toLowerCase()
      this.$emit('update:modelValue', this.person)
      this.book = null
      this.searches = this.$store.state.peopleList.filter(
        person =>
          search.length &&
          person.name.toLowerCase().includes(search) &&
          person.role === this.person.role,
      )
    },
    hideSearch() {
      this.searches = []
    },
    fillPerson(p) {
      this.hideSearch()
      this.person.name = p.name
      this.person.id = p.id
      this.person.role = p.role
      this.$emit('update:modelValue', this.person)
      this.$emit('person-selected', p)
      this.mode = 'view'
    },
    onDivClick() {
      this.mode = 'edit'
      // on the moment of function execution $refs.input
      // is still not exists beacuse of v-if
      // so timeout 0 used to wait it to be created
      setTimeout(() => {
        this.$refs.input.focus()
      }, 0)
    },
    onClickOutside(e) {
      this.searches = []
      if (e.target === this.$refs.input) {
        return
      }
      this.mode = 'view'
    },
    onEnter() {
      this.searches = []
      this.mode = 'view'
    },
    onInputBlur() {
      if (this.searches.length) {
        return
      }
      this.mode = 'view'
    },
    onEsc() {
      if (this.searches.length) {
        this.searches = []
        return
      }
      this.mode = 'view'
    },
  },
}
</script>

<template>
  <div class="control">
    <div class="field is-grouped">
      <div class="control">
        <button class="is-flat" @click.prevent="toggleRole">
          <i v-if="person.role === 'author'" class="fas fa-pencil-alt" />
          <i v-if="person.role === 'illustrator'" class="fas fa-palette" />
        </button>
      </div>
      <div class="control w-50">
        <div v-if="mode === 'view'" class="w-50 pointer" @click="onDivClick">{{ person.name }}</div>
        <input
          v-if="mode === 'edit'"
          ref="input"
          v-model="person.name"
          type="text"
          class="input"
          @blur="onInputBlur"
          @keyup.enter="onEnter"
          @keyup.escape="onEsc"
          @input="doSearch"
        />
        <div v-if="searches.length" v-click-outside="onClickOutside" class="search-wrap">
          <div class="search-results">
            <div
              v-for="res of searches"
              :key="res.id"
              class="media p-2"
              @click.prevent="fillPerson(res)"
            >
              <b>{{ res.name }}</b
              ><br />
            </div>
          </div>
        </div>
      </div>
      <div v-if="mode === 'view' && person.name.length && !person.id" class="control">
        <i
          class="fas fa-exclamation-triangle fa-danger"
          v-tippy="{
            content:
              'Person not exists in database and will be automatically approved and created without biography',
          }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input {
  margin-top: -0.25rem;
  margin-left: -0.25rem;
  padding: 0.2rem;
  height: 2rem;
}

.w-50 {
  min-width: 50%;
  min-height: 24px;
}

.pointer {
  cursor: text;
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
