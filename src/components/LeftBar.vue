<template>
  <aside class="is-align-self-stretch menu px-5 is-flex-direction-column is-justify-content-space-between">
    <div id="logo">
      <router-link :to="{name: 'Home'}"><span class="wrapper"><img title="COLORFUL READS X COLORFUL PEOPLE: Picture books curated by leaders in the industry" src="@/assets/logo.png"></span></router-link>
    </div>
    <ul class="menu-list is-flex-grow-1">
      <li><router-link :to="{name: 'Home'}">Books</router-link></li>
      <li id="books-filter-menu"></li>
      <li><router-link :to="{name: 'Bundles'}">Book Bundles</router-link></li>
      <li><router-link :to="{name: 'People'}">People</router-link></li>
      <li><router-link :to="{name: 'Instagram'}">Instagram</router-link></li>
      <li><router-link :to="{name: 'Support'}">Support</router-link></li>
      <li><router-link :to="{name: 'About'}">About</router-link></li>
    </ul>
    <ul v-if="$iam('superadmin')" class="menu-list mt-5">
      <li><router-link :to="{name: 'TagsManager'}">Tags Manager</router-link></li>
      <li><router-link :to="{name: 'BooksManager'}">Books Manager</router-link></li>
      <li><router-link :to="{name: 'BundlesManager'}">Bundle Manager</router-link></li>
      <li><router-link :to="{name: 'PeopleManager'}">People Manager</router-link></li>
    </ul>
    <ul class="menu-list mt-5">
      <li v-if="!$iam('authorized')"><router-link :to="{name: 'LogIn'}">LogIn</router-link></li>
      <li v-if="$iam('authorized')"><router-link :to="{name: 'Profile'}">Profile</router-link></li>
      <li v-if="$iam('authorized')"><router-link :to="{name: 'LogOut'}">LogOut</router-link></li>
    </ul>
  </aside>
</template>

<style scoped lang="scss">
@import '@/assets/vars.scss';

#logo {
  width: 80px;
  height: 80px;
  background: $atw-base;
  border-radius: 50%;
  margin: 20px;
}

a {
  font-size: 150%;
  font-weight: bold;
  text-transform: uppercase;
  text-align: left;
}
</style>
