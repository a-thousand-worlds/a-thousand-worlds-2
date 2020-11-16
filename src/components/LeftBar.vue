<template>
  <aside class="is-align-self-stretch menu px-5 is-flex-direction-column is-justify-content-space-between">
    <ul class="menu-list is-flex-grow-1">
      <li><router-link :to="{name: 'Home'}">Books</router-link></li>
      <li id="books-filter-menu"></li>
      <li><router-link :to="{name: 'Bundles'}">Book Bundles</router-link></li>
      <li><router-link :to="{name: 'People'}">People</router-link></li>
      <li><router-link :to="{name: 'Instagram'}">Instagram</router-link></li>
      <li><router-link :to="{name: 'Support'}">Support</router-link></li>
      <li><router-link :to="{name: 'About'}">About</router-link></li>
    </ul>
    <ul class="menu-list mt-5">
      <li v-if="!$store.state.user"><router-link :to="{name: 'LogIn'}">LogIn</router-link></li>
      <li v-if="$iam('superadmin')"><router-link :to="{name: 'TagsManager'}">Tags Manager</router-link></li>
      <li v-if="$iam('superadmin')"><router-link :to="{name: 'BooksManager'}">Books Manager</router-link></li>
      <li v-if="$iam('authorized')"><router-link :to="{name: 'Profile'}">Profile</router-link></li>
      <li v-if="!$iam('authorized')"><router-link :to="{name: 'LogOut'}">LogOut</router-link></li>
    </ul>
  </aside>
</template>

<style scoped lang="scss">
a {
  font-size: 150%;
  font-weight: bold;
  text-transform: uppercase;
  text-align: left;
}
</style>
