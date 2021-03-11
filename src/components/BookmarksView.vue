<script>
import BookmarkWidget from '@/components/BookmarkWidget'

export default {
  components: {
    BookmarkWidget
  },
  computed: {
    bookmarks() {
      return Object.keys(this.$store.state.user.user.profile.bookmarks || {})
        .map(id => ({ id, type: this.$store.state.user.user.profile.bookmarks[id] }))
    }
  },
  methods: {
    unmarkAll() {
      this.$store.dispatch('user/clearBookmarks')
    }
  }
}
</script>

<template>
  <div class="bookmarks-view">
    <p v-if="!bookmarks.length">You don't have any bookmarks yet.</p>
    <BookmarkWidget v-for="(bookmark, i) of bookmarks" :key="i" :bookmark="bookmark" class="bookmark-widget" />
    <div v-if="bookmarks.length" class="container has-text-right">
      <a class="unmark-all m-5" @click.prevent="unmarkAll">Unsave All</a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";

a.unmark-all {
  color: #333;
  text-decoration: none;
  text-transform: uppercase;
}

.bookmarks-view {
  margin: 30px 20px;
  @include from($tablet) {
    margin-left: 10px;
    margin-right: 10px;
  }
}

.bookmark-widget {
  margin-bottom: 50px;
  @include from($tablet) {
    margin-bottom: 20px;
  }
}

</style>
