import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import VueTippy from 'vue-tippy'
import 'tippy.js/dist/tippy.css'
import CKEditor from '@ckeditor/ckeditor5-vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import directives from '@/directives'
import mixins from '@/mixins/global'

require('@/assets/style/main.scss')

router.beforeEach((to, from, next) => {
  if (!to.meta || !to.meta.access) {
    next()
    return
  }
  let access = to.meta.access
  if (!Array.isArray(access)) access = [access]
  if (!store.state.user.user || !store.state.user.user.roles) {
    store.commit('ui/setPageLoading', true)
    store.dispatch('user/next')
      .then(user => {
        store.commit('ui/setPageLoading', false)
        if (access.some(mixins.methods.$iam)) next()
        else next('/404')
      })
      .catch(err => {
        store.commit('ui/setPageLoading', false)
        console.error('user/next error', err)
        next('/404')
      })
  }
  // when a user signs up with an invite code, they are directed to the dashboard, but their role is updated asynchronously, to this logic may incorrectly trigger an authentication failure
  // do not redirect to 404 in this case since it breaks the signup process
  else {
    // if (access.some(mixins.methods.$iam)) next()
    // else next('/404')
    next()
  }
})

router.afterEach((to, from) => {
  store.commit('ui/setBookmarksOpen', false)
})

// global error handling
window.addEventListener('onerror', function(msg, url, line, col, error) {
  console.error(msg, url, line, col, error)
  store.dispatch('ui/popup', { text: msg, type: 'error', autoclose: false })
})
window.addEventListener('unhandledrejection', function(e) {
  store.dispatch('ui/popup', { text: e.reason, type: 'error', autoclose: false })
})

const app = createApp(App)
  .use(createHead())
  .use(store)
  .use(router)
  .use(CKEditor)
  .use(VueTippy)

// sourced from https://stackoverflow.com/questions/63869859/detect-click-outside-element-on-vue-3
Object.entries(directives).forEach(([name, directive]) => app.directive(name, directive))

app.mixin(mixins)

app.mount('#app')
