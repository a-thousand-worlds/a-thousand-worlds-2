import { createApp } from 'vue'
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
        if (access.reduce((acc, x) => store.state.user.user.roles[x] || acc, false)) next()
        else next('/404')
      })
      .catch(err => {
        store.commit('ui/setPageLoading', false)
        console.log('user/next error', err)
        next('/404')
      })
  }
  else {
    if (access.reduce((acc, x) => store.state.user.user.roles[x] || acc, false)) next()
    else next('/404')
  }
})

router.afterEach((to, from) => {
  store.commit('ui/setBookmarksOpen', false)
})

const app = createApp(App)
  .use(store)
  .use(router)
  .use(CKEditor)
  .use(VueTippy)

// sourced from https://stackoverflow.com/questions/63869859/detect-click-outside-element-on-vue-3
Object.entries(directives).forEach(([name, directive]) => app.directive(name, directive))

app.mixin(mixins)

app.mount('#app')
