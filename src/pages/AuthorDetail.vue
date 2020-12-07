<script>
import LazyImage from '@/components/LazyImage'
import BookList from '@/components/BookList'

export default {
  components: {
    LazyImage,
    BookList,
  },
  data() {
    return {
      author: null,
      pageUrl: window.location.href,
    }
  },
  created() {
    const id = this.$router.currentRoute._value.params.id
    this.author = this.$store.state.peopleIndex[id]
    window.scrollTo(0, 0)
  },
  watch: {
    '$route'(next) {
      const id = this.$router.currentRoute._value.params.id
      this.author = this.$store.state.peopleIndex[id]
      window.scrollTo(0, 0)
    },
    '$store.state.peopleIndex'(next, prev) {
      const id = this.$router.currentRoute._value.params.id
      if (next && Object.keys(next).length && !next[id]) {
        // author not found! drop to 404
        // timeout to make router finish any his current work, if doing any
        setTimeout(() => {
          // eslint-disable-next-line fp/no-mutating-methods
          this.$router.push('/404')
        }, 0)
      }
      this.author = this.$store.state.peopleIndex[id]
    }
  },
  computed: {
    isAuthor() {
      return this.author ? this.author.role === 'author' : true
    },
    books() {
      return this.author ? this.$store.state.booksList.filter(book => book.authors.includes(this.author.name)) : []
    }
  }
}

</script>

<template>

  <div v-if="author" class="mx-5">

    <div class="is-flex is-flex-direction-row is-flex-wrap-wrap">
      <div class="column-author">
        <div v-if="author.photo && author.photo.length" class="cover-wrapper">
          <lazy-image class="cover" :src="author.photo"/>
        </div>

        <div class="title-container divider-bottom">
          <div v-if="isAuthor">
            <i class="fas fa-pencil-alt"></i>
            <span class="name ml-2">Author</span>
          </div>
          <div v-if="!isAuthor">
            <i class="fas fa-palette"></i>
            <span class="name ml-2">Illustrator</span>
          </div>
          <h1 class="title mt-5">{{author.name}}</h1>
        </div>

        <p style="font-size: 22px;">{{author.bio}}</p>

      </div>

      <div class="column-books">
        <book-list v-for="(book, i) of books" :key="i" :book="book" :colorI="i"/>
      </div>

    </div>

  </div>

  <!-- Add a bottom spacer so that fixed position footer clears content when scrolled to the bottom. -->
  <div class="mb-7" />

</template>

<style lang="scss" scoped>
@import '@/assets/main.scss';

.directory-nav-link {
  color: black;
}

.column-author {
  width: 100%;

  @include from($widescreen) {
    width: 48%;
    margin-right: 0.75rem;
  }
}

.column-books {
  width: 100%;

  @include from($widescreen) {
    width: 48%;
  }
}

.cover-wrapper {
  max-width: 180px;
  width: 100%;
  height: 100%;
  border: 1px solid $atw-base;
  border-radius: 50%;
}

.title {
  font-size: 50px;
  line-height: 1;
  margin-bottom: 0;
}

.divider-bottom {
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: solid 1px #ddd;
}

/* Unstyled button for text that needs to sit next to a button and have the same size and padding. */
.button-unstyled {
  cursor: default;
  background-color: transparent;
  border-color: transparent !important;
}

</style>
