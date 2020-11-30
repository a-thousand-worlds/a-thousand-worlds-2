<script>
export default {
  props: ['book']
}
</script>

<template>
  <div class="book-list-wrapper columns">
    <div class="column is-one-third">
      <img class="cover" :src="book.cover"/>
    </div>
    <div class="column is-two-thirds">
    <router-link :to="{name:'Home',params:{bid:book.id}}" class="cover-data">
      <div class="title">{{book.title}}</div>
    </router-link>
      <div class="authors">
        <div class="author">{{book.authors}}</div>
      </div>
    </div>
  </div>
</template>
