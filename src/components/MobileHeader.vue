<script>
export default {
  data() {
    return {
      isOpen: false
    }
  },
  watch: {
    '$route'() {
      this.isOpen = false
    }
  }
}
</script>

<template>
<div>
<div class="back"/>
<section class="header p-2">
  <div class="level is-flex">
    <div class="level-item">
      <div class="title">A THOUSAND WORLDS</div>
    </div>
    <div class="level-right">
      <div class="level-item">
        <button @click="isOpen = !isOpen" class="menu-button button">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>
  </div>
</section>
<section v-if="isOpen" class="submenu p-2 is-align-self-stretch is-flex-direction-column is-justify-content-space-between">
  <ul class="has-text-centered is-flex-grow-1">
    <li><router-link :to="{name: 'Home'}">Books</router-link></li>
    <li><router-link :to="{name: 'Bundles'}">Book Bundles</router-link></li>
    <li><router-link :to="{name: 'People'}">People</router-link></li>
    <li><router-link :to="{name: 'Support'}">Support</router-link></li>
    <li><router-link :to="{name: 'About'}">About</router-link></li>
    <li v-if="!$iam('authorized')"><router-link :to="{name: 'LogIn'}">LogIn</router-link></li>
    <li v-if="$iam('authorized')"><router-link :to="{name: 'Profile'}">Profile</router-link></li>
    <li v-if="$iam('authorized')"><router-link :to="{name: 'LogOut'}">LogOut</router-link></li>
  </ul>

    <div class="level mt-5 is-flex is-justify-content-space-evenly">
      <div class="level-item">
        <i class="fab fa-instagram fa-2x"></i>
      </div>
      <div class="level-item">
        <i class="fab fa-twitter fa-2x"></i>
      </div>
    </div>

</section>
</div>
</template>

<style lang="scss" scoped>
@import '@/assets/vars.scss';
.header {
  border-bottom: 1px solid $atw-base;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  z-index: 5;
}
.submenu {
  position: fixed;
  top: 41px;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  z-index: 5;
  // opacity: 0.8;
}
.back {
  position: fixed;
  top: 0;
  left: 0;
  content: '';
  background-color: #fff;
  width: 100%;
  height: 40px;
  z-index: 4;
  // opacity: 0.8;
}
.title {
  font-size: 1.6rem;
}
.menu-button {
  background: none;
  border: none;
  padding-top: 0;
  padding-bottom: 0;
  height: 30px;
  top: -8px;
  position: relative;
}
a {
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;

  color: #4a4a4a;
  display: block;
  padding: 0.5em 0.75em;
}
</style>
