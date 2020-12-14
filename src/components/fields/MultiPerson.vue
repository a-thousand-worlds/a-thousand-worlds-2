<script>

export default {
  props: ['modelValue', 'disabled', 'searchDb', 'role'],
  emits: ['update:modelValue', 'person-selected', 'person-removed'],
  data() {
    return {
      names: this.modelValue || '',
      people: this.modelValue && this.modelValue.length ? this.modelValue.split(',').map(x => x.trim()) : [],
      searches: [],
      mode: 'view'
    }
  },
  computed: {
    hasNewPeople() {
      if (!this.people.length) {
        return false
      }
      return !this.people
        .map(name => this.$store.state.peopleList.reduce((acc, p) => p.name.toLowerCase() === name.toLowerCase() ? true : acc, false))
        .reduce((acc, exists) => acc && exists, true)
    }
  },
  created() {
  },
  methods: {
    doSearch(e) {
      console.log('search', this.names)
      this.$emit('update:modelValue', this.names)
      if (!this.searchDb) {
        return
      }
      const search = this.names
      this.searches = this.$store.state.peopleList
        .filter(person => search.length && person.name.toLowerCase().includes(search) && person.role === this.role)
    },
    fillPerson(p) {
      this.searches = []
      /*
      this.person.id = p.id
      this.person.role = p.role
      this.$emit('update:modelValue', this.names)
      this.$emit('person-selected', p)
      /**/
      this.mode = 'view'
    },
    onDivClick() {
      if (this.disabled) {
        return
      }
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
      this.people = this.names.split(',').map(x => x.trim())
      this.$emit('update:modelValue', this.people.join(', '))
      this.mode = 'view'
    },
    onEsc() {
      if (this.searches.length) {
        this.searches = []
        return
      }
      this.mode = 'view'
    }
  },
  watch: {
    modelValue(next, prev) {
      this.names = next
    }
  }
}
</script>

<template>

<div class="control">
  <div class="field is-grouped">
    <div class="control" :class="{disabled:disabled}">
      <span v-if="role === 'author'">by</span>
      <span v-if="role === 'illustrator'">illustrated by</span>
    </div>
    <div class="control w-50">
      <div :class="{disabled:disabled}" class="w-50 pointer" v-if="mode === 'view'" @click="onDivClick()">{{names}}</div>
      <input
        v-if="mode === 'edit'"
        @blur="onInputBlur"
        @keyup.enter="onEnter"
        @keyup.escape="onEsc"
        @input="doSearch"
        ref="input"
        type="text"
        class="input"
        v-model="names">
      <div v-click-outside="onClickOutside" v-if="searches.length" class="search-wrap">
        <div class="search-results">
          <div @click.prevent="fillPerson(res)" class="media p-2" v-for="res of searches" :key="res.id">
            <b>{{res.name}}</b><br>
          </div>
        </div>
      </div>
    </div>
    <div v-if="mode === 'view' && hasNewPeople" class="control">
      <i :class="{disabled:disabled}" class="fas fa-exclamation-triangle fa-danger" title="There is a not existing in database person. On book approve they will be automatically approved and created without biography"></i>
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

.disabled {
  color: #ddd;
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
