<script>
import TagsTable from '@/components/TagsTable'

export default {
  name: 'TagsManagerPage',
  components: {
    TagsTable,
  },
  data() {
    return {
      active: 'books'
    }
  },
  methods: {
    setActive(value) {
      this.active = value
    },
  },
}

</script>

<template>

  <div class="m-20 is-flex is-justify-content-center">
    <div class="is-flex-grow-1 mx-20" style="max-width: 760px;">

      <h1 class="title page-title level-item">Tags Manager</h1>

      <div class="tabs">
        <ul>
          <li :class="{ 'is-active': active === 'books' }"><a @click.prevent="setActive('books')">Books</a></li>
          <li :class="{ 'is-active': active === 'bundles' }"><a @click.prevent="setActive('bundles')">Bundles</a></li>
          <li :class="{ 'is-active': active === 'people' }"><a @click.prevent="setActive('people')">People</a></li>
        </ul>
      </div>

      <TagsTable :type="active" />

    </div>
  </div>

</template>
