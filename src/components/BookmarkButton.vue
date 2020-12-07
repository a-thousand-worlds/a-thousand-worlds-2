<script>
import BookmarkIcon from '../assets/icons/bookmark.svg'
import BookmarkMarkedIcon from '../assets/icons/bookmark-marked.svg'

export default {
  props: ['book'],
  components: {
    BookmarkIcon,
    BookmarkMarkedIcon,
  },
  data() {
    return {
      marked: false,
    }
  },
  methods: {
    toggleBookmark() {
      if (!this.$iam('authorized')) {
        // eslint-disable-next-line fp/no-mutating-methods
        this.$router.push({ name: 'LogIn' })
      }
      else {
        // optimistic client-side toggle
        this.marked = !this.marked
        console.log('bm me!', this.book)
      }
    }
  },
}
</script>

<template>
  <div style="cursor: pointer;" @click.prevent="toggleBookmark">
    <BookmarkMarkedIcon v-if="marked" />
    <BookmarkIcon v-else />
  </div>
</template>

<style lang="scss" scoped>

</style>
