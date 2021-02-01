<script>
import ISBN from 'isbn3'

export default {
  props: {
    book: {
      required: true
    },
  },
  data() {
    return {
      amazonAffiliateCode: process.env.VUE_APP_AMAZON_AFFILIATE_CODE,
      indieboundAffiliateCode: process.env.VUE_APP_INDIEBOUND_AFFILIATE_CODE,
    }
  },
  computed: {
    isbn10() {
      return ISBN.asIsbn10(this.book?.isbn || '')
    }
  },
}

</script>

<template>
  <div class="content-footer">
    <div class="content-footer-inner">
      <div class="link-container">

        <button class="button button-unstyled is-primary pl-0">FIND BOOK AT</button>

        <button class="button is-rounded is-secondary mx-1 test">
          <i class="fas fa-university mr-1" /> LOCAL LIBRARY
        </button>

        <a :href="`https://amzn.com/${isbn10}?tag=${amazonAffiliateCode}`" target="_blank"><button class="button is-rounded is-secondary mx-1">
          <i class="fas fa-shopping-cart mr-1" /> AMAZON
        </button></a>

        <a :href="`http://www.indiebound.org/book/${book.isbn}?aff=${indieboundAffiliateCode}`" target="_blank"><button class="button is-rounded is-secondary mx-1">
          <i class="fas fa-shopping-cart mr-1" /> INDIE BOOKSELLERS
        </button></a>

        <a v-if="book.goodread" :href="`https://www.goodreads.com/book/show/${book.goodread}`" target="_blank"><button class="button is-rounded is-secondary mx-1 mr-20">
          <i class="fas fa-book-open mr-1" /> GOODREADS
        </button></a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import '@/assets/style/mixins.scss';
@import '@/assets/style/vars.scss';

.content-footer {
  @include primary(background-color);
  position: fixed;
  bottom: 0;
  color: $primary-invert;
  width: calc(100% - #{$leftbar-width} - #{$rightbar-width});
  white-space: nowrap;
  overflow: auto;

  @include until($tablet) {
    left: 0;
    width: 100%;
    padding-bottom: $mobile-footer-height;
  }

  .button, input {
    border: solid 1px #666;
  }
}

.content-footer-inner {
  display: flex;
  justify-content: flex-start;
  margin: 10px 20px;

  // use custom breakpoint between tablet and desktop to preserve centering when there is room
  @include from(900px) {
    margin: 20px 60px;
    justify-content: center;
  }
  @include from($widescreen) {
    justify-content: space-between;
  }
}

.link-container {
  width: 100%;
  text-align: center;

  // when the page link component is shown, align text right
  @include from($widescreen) {
    text-align: right;
  }
}

</style>
