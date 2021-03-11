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
    // e.g. http://localhost:8080/book/my-mommy-medicine-9781250140913
    // slug: my-mommy-medicine
    // isbn: 9781250140913
    path: '/book/:slug(.+)?-:isbn',
    // slug is expected to be omitted, but is included in the pattern to stifle a vue-router warning
    alias: '/book/:slug?/:isbn(.*)',
    name: 'BookDetail',
    component: () => import(/* webpackChunkName: "guest" */ './pages/BookDetail.vue')
  }, {
    path: '/person/:name',
    name: 'PersonDetail',
    component: () => import(/* webpackChunkName: "guest" */ './pages/PersonDetail.vue')
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
    name: 'Login',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Login.vue')
  }, {
    path: '/password-reset',
    name: 'PasswordReset',
    component: () => import(/* webpackChunkName: "guest" */ './pages/PasswordReset.vue')
  }, {
    path: '/signup',
    name: 'Signup',
    component: () => import(/* webpackChunkName: "guest" */ './pages/Login.vue')
  }, { // User authorized paged
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import(/* webpackChunkName: "user" */ './pages/Dashboard.vue'),
    meta: {
      access: 'authorized'
    }
  }, {
    path: '/contributor',
    name: 'ContributorProfile',
    component: () => import(/* webpackChunkName: "contributor" */ './pages/ContributorProfile.vue'),
    meta: {
      access: 'authorized'
    },
  }, {
    path: '/profile',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "user" */ './pages/Login.vue'),
    meta: {
      access: 'authorized'
    }
  }, {
    path: '/suggest/:type/thankyou',
    name: 'SubmissionThankYou',
    component: () => import(/* webpackChunkName: "user" */ './pages/SubmissionThankYou.vue'),
    meta: {
      access: ['contributor', 'creator', 'advisor', 'owner']
    }
  }, {
    path: '/suggest/book',
    name: 'BookSubmissionForm',
    component: () => import(/* webpackChunkName: "contributor" */ './pages/BookSubmissionForm.vue'),
    meta: {
      access: ['contributor', 'advisor', 'owner']
    }
  }, {
    path: '/suggest/bundle',
    name: 'BundleSubmissionForm',
    component: () => import(/* webpackChunkName: "contributor" */ './pages/BundleSubmissionForm.vue'),
    meta: {
      access: ['contributor', 'advisor', 'owner']
    }
  }, {
    path: '/suggest/people',
    name: 'PersonSubmissionForm',
    component: () => import(/* webpackChunkName: "creator" */ './pages/PeopleSubmissionForm.vue'),
    meta: {
      access: ['creator', 'advisor', 'owner']
    }
  }, {
    path: '/admin/tags',
    name: 'TagsManager',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/TagsManager.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/people',
    name: 'PeopleManager',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/PeopleManager.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/person/:name/edit',
    name: 'PersonEdit',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/PersonEdit.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/people/add',
    name: 'PeopleManagerAddForm',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/PeopleManagerForm.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/people/update/:uid',
    name: 'PeopleManagerUpdateForm',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/PeopleManagerForm.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/book/:slug(.+)?-:isbn/edit',
    alias: '/book/:slug?/:isbn(.*)/edit',
    name: 'BookEdit',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/BookEdit.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/books',
    name: 'BooksManager',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/BooksManager.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/books/update/:bid',
    name: 'BookManagerUpdateForm',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/BookManagerForm.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/books/add',
    name: 'BookManagerAddForm',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/BookManagerForm.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/bundles',
    name: 'BundlesManager',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/BundlesManager.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/bundles/update/:bid',
    name: 'BundleManagerUpdateForm',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/BundleManagerForm.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/bundles/add',
    name: 'BundleManagerNewForm',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/BundleManagerForm.vue'),
    meta: {
      access: 'owner'
    }
  }, {
    path: '/admin/email-templates',
    name: 'EmailTemplates',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/EmailTemplates.vue'),
    meta: {
      access: ['advisor', 'owner']
    }
  }, {
    path: '/admin/invitation-manager',
    name: 'InvitationManager',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/InvitationManager.vue'),
    meta: {
      access: ['advisor', 'owner']
    }
  }, {
    path: '/admin/review/:type',
    name: 'ReviewSubmissions',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/ReviewSubmissions'),
    meta: {
      access: ['advisor', 'owner']
    }
  }, {
    path: '/admin/review/:type/rejected',
    name: 'ReviewRejectedSubmissions',
    component: () => import(/* webpackChunkName: "advisor" */ './pages/ReviewSubmissions/Rejected'),
    meta: {
      access: ['advisor', 'owner']
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
  // scroll to top on navigate, except for back/forward and same page (e.g. filter change)
  // https://router.vuejs.org/guide/advanced/scroll-behavior.html#async-scrolling
  scrollBehavior(to, from, savedPosition) {
    const samePage = from.name === to.name
    // position is not saved with router.replace, so we need to get the scroll position manually
    return savedPosition || { left: 0, top: samePage ? window.scrollY : 0 }
  }
})

export default router
