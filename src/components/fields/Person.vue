<script>

export default {
  props: ['modelValue', 'disabled', 'role'],
  emits: ['update:modelValue', 'personSelected'],
  data() {
    return {
      name: this.modelValue || '',
      searches: [],
    }
  },
  methods: {
    doSearch(e) {
      const search = e.target.value.toLowerCase()
      this.$emit('update:modelValue', search)
      // this.book = null
      // this.searches = this.$store.state.peopleList
      // .filter(person => search.length && person.name.toLowerCase().includes(search) && (this.role ? person.role === this.role : true))
    },
    hideSearch() {
      this.searches = []
    },
    fillPerson(p) {
      this.hideSearch()
      this.name = p.name
      this.$emit('update:modelValue', this.name)
      this.$emit('person-selected', p)
    }
  },
  watch: {
    modelValue(next, prev) {
      this.name = next
    }
  }
}
</script>

<template>

<div class="control">
  <input :disabled="disabled" type="text" class="input" v-model="name" @input="doSearch($event)">
  <div v-click-outside="hideSearch" v-if="searches.length" class="search-wrap">
    <div class="search-results">
      <div @click.prevent="fillPerson(res)" class="media p-2" v-for="res of searches" :key="res.id">
        <b>{{res.name}}</b><br>
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
