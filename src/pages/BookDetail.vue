<script>
import AuthorWidget from '@/components/AuthorWidget'
import BookmarkButton from '@/components/BookmarkButton'

export default {
  name: 'BookDetail',
  components: {
    'author-widget': AuthorWidget,
    'bookmark-button': BookmarkButton,
  },
  computed: {
    book() {
      const id = this.$router.currentRoute._value.params.id
      return this.$store.state.books[id] || {}
    },
    url() {
      return window.location.href
    }
  }
}

</script>

<template>

  <div class="content mx-6">

    <div class="directory-navbar mt-4 mb-5">
      <div class="is-flex is-justify-content-space-between">
        <div>
          <router-link :to="{ name: 'Home' }" class="directory-nav-link is-uppercase">&lt; Back to Books</router-link>
        </div>
        <div>
          <router-link :to="{ name: 'Home' }" class="directory-nav-link is-uppercase mx-6">&lt; Previous Book</router-link>
          <router-link :to="{ name: 'Home' }" class="directory-nav-link is-uppercase">Next Book &gt;</router-link>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-two-fifths mr-4">
        <div class="book-cover-wrapper">
          <img class="cover" :src="book.cover"/>
        </div>
      </div>

      <div class="column">
        <div class="title-container divider-bottom is-flex is-justify-content-space-between">
          <h1 class="title">{{book.title}}</h1>
          <div style="padding-top: 0px;"><bookmark-button /></div>
        </div>

        <div class="authors divider-bottom">
          <div v-for="person of book.authors" :key="person" class="mb-2">
            <author-widget :name="person"></author-widget>
          </div>
          <div v-for="person of book.illustrators" :key="person">
            <author-widget :name="person"></author-widget>
          </div>
        </div>

        <p>{{book.description}}</p>

      </div>

    </div>

  </div>

  <!-- Add a bottom spacer so that fixed position footer clears content when scrolled to the bottom. -->
  <div class="mb-7" />

  <div class="content-footer">
    <div class="is-flex is-justify-content-space-between mx-6">
      <div>
        <input type="text" class="input" style="width: 16rem;" :value="url" readonly />
        <button class="button is-rounded mx-1">COPY LINK</button>
      </div>
      <div>
        <button class="button is-rounded mx-1">LOCAL LIBRARY</button>
        <button class="button is-rounded mx-1">LINK</button>
        <button class="button is-rounded mx-1">INDIEBOUND</button>
      </div>
    </div>
  </div>

</template>

<style lang="scss" scoped>
@import '@/assets/vars.scss';

.directory-nav-link {
  color: black;
}

.title {
  font-size: 3.5rem;
  line-height: 1;
  margin-bottom: 0;
}

.divider-bottom {
  padding-bottom: 1rem;
  margin-bottom: 2rem;
  border-bottom: solid 1px #ddd;
}

.content-footer {
  position: fixed;
  bottom: 0;
  background-color: #ddd;
  width: calc(100% - 340px - 70px);
  padding: 1rem;
  margin-left: -18px;
}

</style>
