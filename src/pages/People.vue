<script>
import AuthorCover from '@/components/AuthorCover'

export default {
  components: {
    AuthorCover,
  }
}

</script>

<template>

<div class="container is-flex is-flex-direction-row is-flex-wrap-wrap p-3">
  <div :class="{'with-bookmarks': $store.state.ui.bookmarksOpen}" class="has-text-centered person-block p-3" v-for="(person, i) of $store.state.peopleList" :key="i">
    <author-cover :person="person"/>
  </div>
</div>

</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

.person-block {
  width: 100%;
  margin-bottom: 20px;

  @include from($tablet) {
    width: 50%;
  }

  @include from($desktop) {
    width: 33%;
  }

  @include from($widescreen) {
    width: 25%;
  }

  &.with-bookmarks {
    width: 100%;

    @include from($desktop) {
      width: 50%;
    }

    @include from($widescreen) {
      width: 33%;
    }

  }
}

</style>
