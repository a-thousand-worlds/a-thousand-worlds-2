<script>
import BookmarkWidget from '@/components/BookmarkWidget'

export default {
  components: {
    BookmarkWidget
  },
  computed: {
    bookmarks() {
      return Object.keys(this.$store.state.user.profile.bookmarks || {})
        .map(id => ({ id, type: this.$store.state.user.profile.bookmarks[id] }))
    }
  },
  methods: {
    unmarkAll() {
      this.$store.dispatch('clearBookmarks')
    }
  }
}
</script>

<template>
<div>
  <h1 class="title page-title">Bookmarks</h1>
  <p v-if="!bookmarks.length">You don't have bookmarks yet.</p>
  <bookmark-widget v-for="(mark, i) of bookmarks" :key="i" :mark="mark"/>
  <div v-if="bookmarks.length" class="container has-text-right">
    <a class="unmark-all m-5" :href="null" @click.prevent="unmarkAll()">Unsave All</a>
  </div>
</div>
</template>

<style lang="scss" scoped>
a.unmark-all {
  color: #333;
  text-decoration: none;
  text-transform: uppercase;
}
</style>
