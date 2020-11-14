import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

require('@/assets/main.scss')

router.beforeEach((from, to, next) => {
  if (to.meta && to.meta.access) {
    if (!store.state.user) {
      next('/404')
      return
    }
  }
  next()
})

createApp(App)
  .use(store)
  .use(router)
  .mount('#app')
