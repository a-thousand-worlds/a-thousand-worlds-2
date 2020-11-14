import { createRouter, createWebHistory } from 'vue-router'
// import Home from '@/pages/Home.vue'
import NotFound from '@/pages/NotFound.vue'

const routes = [
  { // Non authorized pages
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Home.vue')
  }, {
    path: '/bundles',
    name: 'Bundles',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Bundles.vue')
  }, {
    path: '/people',
    name: 'People',
    component: () => import(/* webpackChunkName: "guest" */ './pages/People.vue')
  }, {
    path: '/instagram',
    name: 'Instagram',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Instagram.vue')
  }, {
    path: '/support',
    name: 'Support',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Support.vue')
  }, {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "guest" */ './pages/About.vue')
  }, {
    path: '/login',
    name: 'LogIn',
    component: () => import(/* webpackChunkName: "guest" */ './pages/LogIn.vue')
  }, {
    path: '/password-reset',
    name: 'PasswordReset',
    component: () => import(/* webpackChunkName: "guest" */ './pages/PasswordReset.vue')
  }, {
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Register.vue')
  }, { // User authorized paged
    path: '/profile',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "user" */ './pages/Profile.vue')
  }, {
    path: '/logout',
    name: 'LogOut',
    component: () => import(/* webpackChunkName: "user" */ './pages/LogOut.vue')
  }, { // Admin pages
    path: '/tags-manager',
    name: 'TagsManager',
    component: () => import(/* webpackChunkName: "admin" */ './pages/TagsManager.vue'),
    meta: {
      access: 'manage.tags'
    }
  }, {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFound,
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
