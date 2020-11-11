<template>
  <aside class="menu px-5">
    <ul class="menu-list">
      <li><router-link :to="{name: 'Home'}">Books</router-link></li>
      <li id="books-filter-menu"></li>
      <li><router-link :to="{name: 'Bundles'}">Book Bundles</router-link></li>
      <li><router-link :to="{name: 'People'}">People</router-link></li>
      <li><router-link :to="{name: 'Instagram'}">Instagram</router-link></li>
      <li><router-link :to="{name: 'Support'}">Support</router-link></li>
      <li><router-link :to="{name: 'About'}">About</router-link></li>
    </ul>
    <ul class="menu-list mt-5">
      <li><router-link :to="{name: 'LogIn'}">LogIn</router-link></li>
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
