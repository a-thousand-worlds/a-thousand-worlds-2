<script>
import BookmarkIcon from '../assets/icons/bookmark.svg'
import BookmarkMarkedIcon from '../assets/icons/bookmark-marked.svg'

export default {
  props: ['book'],
  components: {
    BookmarkIcon,
    BookmarkMarkedIcon,
  },
  methods: {
    toggleBookmark() {
      if (!this.$iam('authorized')) {
        // eslint-disable-next-line fp/no-mutating-methods
        this.$router.push({ name: 'LogIn' })
      }
      else {
        // optimistic client-side toggle
        this.$store.dispatch('toggleBookmark', {
          id: this.book.id,
          type: 'book'
        })
        // console.log('bm me!', this.book)
      }
    }
  }
}
</script>

<template>
  <div style="cursor: pointer;" @click.prevent="toggleBookmark()">
    <BookmarkMarkedIcon v-if="$store.state.user?.profile?.bookmarks?.[book.id]" />
    <BookmarkIcon v-else />
  </div>
</template>
