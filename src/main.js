import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

require('@/assets/main.scss')

router.beforeEach((from, to, next) => {
  if (to.meta && to.meta.access) {
    if (!store.state.user || !Array.isArray(store.state.user.roles)) {
      next('/404')
      return
    }
    // let access = to.meta.access
    // if (!Array.isArray(access))
    // access = [access]

  }
  next()
})

createApp(App)
  .use(store)
  .use(router)
  .mount('#app')
