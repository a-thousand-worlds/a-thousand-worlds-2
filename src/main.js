import { createApp } from 'vue'
import CKEditor from '@ckeditor/ckeditor5-vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import directives from '@/directives'
import mixins from '@/mixins/global'

require('@/assets/main.scss')

router.beforeEach((to, from, next) => {
  if (!to.meta || !to.meta.access) {
    next()
    return
  }
  if (!store.state.user.user || !store.state.user.user.roles) {
    store.commit('setNAP', to.path)
    next('/loading')
    return
  }
  let access = to.meta.access
  if (!Array.isArray(access)) access = [access]
  if (access.reduce((acc, x) => store.state.user.user.roles[x] || acc, false)) next()
  else next('/404')
})

router.afterEach((to, from) => {
  store.commit('ui/setBookmarksOpen', false)
})

const app = createApp(App)
  .use(store)
  .use(router)
  .use(CKEditor)

// sourced from https://stackoverflow.com/questions/63869859/detect-click-outside-element-on-vue-3
Object.entries(directives).forEach(([name, directive]) => app.directive(name, directive))

app.mixin(mixins)

app.mount('#app')
