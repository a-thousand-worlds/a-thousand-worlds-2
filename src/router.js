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
    path: '/book/:slug?-:isbn',
    name: 'BookDetail',
    component: () => import(/* webpackChunkName: "guest" */ './pages/BookDetail.vue')
  }, {
    path: '/person/:id',
    name: 'PersonDetail',
    component: () => import(/* webpackChunkName: "guest" */ './pages/AuthorDetail.vue')
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
    path: '/signup',
    name: 'Signup',
    component: () => import(/* webpackChunkName: "guest" */ './pages/LogIn.vue')
  }, {
    path: '/loading',
    name: 'Loader',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Loader.vue')
  }, { // User authorized paged
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "user" */ './pages/Dashboard.vue'),
    meta: {
      access: 'authorized'
    }
  }, {
    path: '/profile',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "user" */ './pages/LogIn.vue'),
    meta: {
      access: 'authorized'
    }
  }, {
    path: '/suggest/thankyou',
    name: 'SubmissionThankYou',
    component: () => import(/* webpackChunkName: "contributor" */ './pages/SubmissionThankYou.vue'),
    meta: {
      access: ['contributor', 'admin', 'owner']
    }
  }, {
    path: '/suggest/book',
    name: 'BookSuggest',
    component: () => import(/* webpackChunkName: "contributor" */ './pages/BookSubmissionForm.vue'),
    meta: {
      access: ['contributor', 'admin', 'owner']
    }
  }, {
    path: '/suggest/bundle',
    name: 'BundleSuggest',
    component: () => import(/* webpackChunkName: "contributor" */ './pages/BundleSubmissionForm.vue'),
    meta: {
      access: ['contributor', 'admin', 'owner']
    }
  }, {
    path: '/suggest/people',
    name: 'PeopleSubmissionForm',
    component: () => import(/* webpackChunkName: "creator" */ './pages/PeopleSubmissionForm.vue'),
    meta: {
      access: ['creator', 'admin', 'owner']
    }
  }, {
    path: '/tags-manager',
    name: 'TagsManager',
    component: () => import(/* webpackChunkName: "admin" */ './pages/TagsManager.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/people',
    name: 'PeopleManager',
    component: () => import(/* webpackChunkName: "admin" */ './pages/PeopleManagerList.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/people/add',
    name: 'PeopleManagerAddForm',
    component: () => import(/* webpackChunkName: "admin" */ './pages/PersonManagerForm.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/people/update/:uid',
    name: 'PersonManagerUpdateForm',
    component: () => import(/* webpackChunkName: "admin" */ './pages/PersonManagerForm.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/books',
    name: 'BooksManager',
    component: () => import(/* webpackChunkName: "admin" */ './pages/BooksManagerList.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/books/update/:bid',
    name: 'BookManagerUpdateForm',
    component: () => import(/* webpackChunkName: "admin" */ './pages/BookManagerForm.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/books/add',
    name: 'BookManagerAddForm',
    component: () => import(/* webpackChunkName: "admin" */ './pages/BookManagerForm.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/bundles',
    name: 'BundlesManager',
    component: () => import(/* webpackChunkName: "admin" */ './pages/BundleManagerList.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/bundles/update/:bid',
    name: 'BundleManagerUpdateForm',
    component: () => import(/* webpackChunkName: "admin" */ './pages/BundleManagerForm.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/bundles/add',
    name: 'BundleManagerNewForm',
    component: () => import(/* webpackChunkName: "admin" */ './pages/BundleManagerForm.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/invite',
    name: 'Invite',
    component: () => import(/* webpackChunkName: "admin" */ './pages/Invite.vue'),
    meta: {
      access: ['admin', 'owner']
    }
  }, {
    path: '/admin/invitation-manager',
    name: 'InvitationManager',
    component: () => import(/* webpackChunkName: "admin" */ './pages/InvitationManager.vue'),
    meta: {
      access: ['admin', 'owner']
    }
  }, {
    path: '/admin/review/:type',
    name: 'ReviewSubmissions',
    component: () => import(/* webpackChunkName: "admin" */ './pages/ReviewSubmissions.vue'),
    meta: {
      access: ['admin', 'owner']
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
  // scroll to top on navigate, except for back/forward
  // https://router.vuejs.org/guide/advanced/scroll-behavior.html#async-scrolling
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  }
})

export default router
