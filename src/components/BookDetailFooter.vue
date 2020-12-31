<script>

export default {
  props: {
    book: {
      required: true
    },
  },
  data() {
    return {
      pageUrl: window.location.href,
    }
  },
  watch: {
    '$route'() {
      this.pageUrl = window.location.href
    }
  },
}

</script>

<template>
  <div class="content-footer">
    <div class="content-footer-inner">
      <div class="from-widescreen mr-30">
        <input type="text" class="input from-fullhd" style="width: 16rem;" :value="pageUrl" readonly>
        <button id="copy-link" class="button is-rounded is-secondary mx-10" :data-clipboard-text="pageUrl">Copy <span class="is-hidden-fullhd mx-1"> Page </span> Link</button>
      </div>
      <div class="link-container">
        <button class="button button-unstyled is-primary pl-0">FIND BOOK AT</button>
        <button class="button is-rounded is-secondary mx-1">LOCAL LIBRARY</button>
        <button class="button is-rounded is-secondary mx-1">LINK</button>
        <a :href="`http://www.indiebound.org/book/${book.isbn}?aff=athousandworlds`" target="_blank"><button class="button is-rounded is-secondary ml-1 mr-20">INDIEBOUND</button></a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

.content-footer {
  position: fixed;
  bottom: 0;
  color: $primary-invert;
  background-color: $primary;
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
