<script>
import Clipboard from 'clipboard'
import BookmarkWidget from '@/components/BookmarkWidget'

export default {
  components: {
    BookmarkWidget
  },
  computed: {
    bookmarks() {
      return Object.keys(this.$store.state.user.user.profile.bookmarks || {})
        .map(id => ({ id, type: this.$store.state.user.user.profile.bookmarks[id] }))
    },
    shareLink() {
      const isbns = this.bookmarks.map(bookmark => this.$store.state.books.data[bookmark.id]?.isbn)
      return `${window.location.origin}?books=${isbns.join(',')}`
    }
  },
  mounted() {
    new Clipboard('#copy-link') // eslint-disable-line no-new
  },
  methods: {
    shareAll() {
      this.$store.dispatch('ui/popup', `Shareable link copied to clipboard`)
    },
    unmarkAll() {
      this.$store.dispatch('user/clearBookmarks')
    },
  }
}
</script>

<template>
  <div class="bookmarks-view">

    <div v-if="bookmarks.length" class="container has-text-right mb-20">
      <a id="copy-link" @click="shareAll" :data-clipboard-text="shareLink" v-tippy="{ content: 'Copy a shareable link to the clipboard' }" class="option-link m-5">
        Share List
        <i class="fa fa-share-square ml-1" />
      </a>
    </div>

    <p v-if="!bookmarks.length">You don't have any bookmarks yet.</p>
    <BookmarkWidget v-for="(bookmark, i) of bookmarks" :key="i" :bookmark="bookmark" class="bookmark-widget" />
    <div v-if="bookmarks.length" class="container has-text-right">
      <a class="option-link m-5" @click.prevent="unmarkAll">Unsave All</a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "bulma/sass/utilities/_all.sass";

a.option-link {
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
