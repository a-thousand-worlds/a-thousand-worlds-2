<script>
import BookmarkIcon from '../assets/icons/bookmark.svg'

export default {
  props: ['book'],
  computed: {
    isMarked() {
      return this.$store.state.user.user?.profile?.bookmarks?.[this.book.id]
    }
  },
  components: {
    BookmarkIcon,
  },
  methods: {
    toggleBookmark() {
      if (!this.$iam('authorized')) {
        // eslint-disable-next-line fp/no-mutating-methods
        this.$router.push({ name: 'LogIn' })
      }
      else {
        // optimistic client-side toggle
        this.$store.commit('ui/setBusy', true)
        this.$store.dispatch('user/toggleBookmark', {
          id: this.book.id,
          type: 'book'
        }).then(() => {
          this.$store.commit('ui/setBusy', false)
        })
        // console.log('bm me!', this.book)
      }
    }
  }
}
</script>

<template>
  <div style="cursor: pointer;" @click.prevent="toggleBookmark()">
    <BookmarkIcon :class="{ 'fill-primary': isMarked }" />
  </div>
</template>
