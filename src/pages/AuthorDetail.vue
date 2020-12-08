<script>
// import LazyImage from '@/components/LazyImage'
import BookList from '@/components/BookList'

export default {
  components: {
    // LazyImage,
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
    console.log('person', this.author)
    if (this.author && this.author.photo && this.author.photo.length) {
      this.$store.dispatch('loadImage', this.author.photo)
    }
    window.scrollTo(0, 0)
  },
  watch: {
    '$route'(next) {
      const id = this.$router.currentRoute._value.params.id
      this.author = this.$store.state.peopleIndex[id]
      if (this.author && this.author.photo && this.author.photo.length) {
        this.$store.dispatch('loadImage', this.author.photo)
      }
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
      if (this.author && this.author.photo && this.author.photo.length) {
        this.$store.dispatch('loadImage', this.author.photo)
      }
    }
  },
  computed: {
    isAuthor() {
      return this.author ? this.author.role === 'author' : true
    },
    books() {
      return this.author ? this.$store.state.booksList.filter(book => book.authors.includes(this.author.name)) : []
    },
    bgColor(i) {
      const colors = ['#fefad2', '#98ba93', '#d4c0d6', '#fcf1f5', '#fcebd0', '#f3fef1']
      return colors[Math.floor(Math.random() * colors.length)]
    },
    bgImage() {
      return this.$store.state.images[this.author.photo] || ''
    }

  }
}

</script>

<template>

  <div v-if="author" class="mx-5">

    <div class="is-flex is-flex-direction-row is-flex-wrap-wrap">
      <div class="column-author" :class="{'with-bookmarks': $store.state.bookmarksOpen}">
        <div class="cover-wrapper">
          <div v-if="author.photo && author.photo.length" :style="{backgroundColor: bgColor, backgroundImage: 'url('+bgImage+')'}" class="cover-photo"/>
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

        <p class="person-bio">{{author.bio}}</p>

      </div>

      <div class="column-books" :class="{'with-bookmarks': $store.state.bookmarksOpen}">
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
  text-align: center;

  @include from($widescreen) {
    width: 48%;
    margin-right: 0.75rem;
    text-align: left;
  }

  &.with-bookmarks {
    width: 100%;
    text-align: center;
  }
}

.column-books {
  width: 100%;

  @include from($widescreen) {
    width: 48%;
  }

  &.with-bookmarks {
    width: 100%;
  }
}

.cover-wrapper {
  max-width: 180px;
  max-height: 180px;
  text-align: center;
  margin: auto;
  margin-bottom: 10px;

  @include from($widescreen) {
    text-align: left;
  }
}

.cover-photo {
  padding-top: 100%;
  width: 100%;
  border: 1px solid $atw-base;
  border-radius: 50%;
  background-size: cover;
}

.title {
  line-height: 1;
  margin-bottom: 0;
}

.person-bio {
  font-size: 22px;
  text-align: justify;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: solid 1px #ddd;

  @include from($widescreen) {
    text-align: left;
    border-bottom: none;
  }
}

/* Unstyled button for text that needs to sit next to a button and have the same size and padding. */
.button-unstyled {
  cursor: default;
  background-color: transparent;
  border-color: transparent !important;
}
</style>
