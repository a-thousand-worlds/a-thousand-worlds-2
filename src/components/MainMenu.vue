<script>
import InstagramIcon from '../assets/icons/instagram.svg'
import TwitterIcon from '../assets/icons/twitter.svg'

export default {
  components: {
    InstagramIcon,
    TwitterIcon,
  },
  methods: {
    logout() {
      this.$store.dispatch('user/logout')
    }
  },
}
</script>

<template>
  <div>
    <ul class="menu-list is-flex-grow-1">
      <li><router-link :to="{name: 'Home'}" :class="{ 'router-link-active': $route.name === 'BookDetail' }">Books</router-link></li>
      <li id="books-filter-menu" />
      <li><router-link :to="{name: 'Bundles'}">Book Bundles</router-link></li>
      <li id="bundles-filter-menu" />
      <li><router-link :to="{name: 'People'}">People</router-link></li>
      <li id="people-filter-menu" />
      <li><router-link :to="{name: 'Support'}">Support</router-link></li>
      <li><router-link :to="{name: 'About'}">About</router-link></li>
      <li v-if="!$iam('authorized')"><router-link :to="{name: 'LogIn'}">Log In</router-link></li>
      <li v-if="$iam('authorized')"><router-link :to="{name: 'Dashboard'}">Dashboard</router-link></li>

      <li v-if="$iam('authorized')"><a @click.prevent="logout">Log Out</a></li>
    </ul>

    <ul class="menu-list mt-50">
      <li>
        <a href="https://instagram.com" target="_blank" class="inline pr-20"><InstagramIcon /></a>
        <a href="https://twitter.com" target="_blank" class="inline"><TwitterIcon /></a>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/style/mixins.scss';

.menu-list a {
  color: black;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  padding: 0 0 20px 0;

  &.router-link-active {
    @include primary(color)
  }

  &:hover {
    background: none;
    @include primary(color)
  }
}

.inline {
  display: inline;
}

</style>
