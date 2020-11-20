import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import dayjs from 'dayjs'

require('@/assets/main.scss')

router.beforeEach((to, from, next) => {
  if (!to.meta || !to.meta.access) {
    next()
    return
  }
  if (!store.state.user || !store.state.user.roles) {
    next('/404')
    return
  }
  console.log('check access', to.meta.access)
  let access = to.meta.access
  if (!Array.isArray(access)) {
    access = [access]
  }
  if (access.reduce((acc, x) => store.state.user.roles[x] || acc, false)) {
    next()
  }
  else {
    next('/404')
  }
})

const app = createApp(App)
  .use(store)
  .use(router)

app.mixin({
  methods: {
    $iam(role) {
      if (!this.$store.state.user) {
        return false
      }
      console.log('iam?', role, this.$store.state.user.roles)
      return this.$store.state.user && this.$store.state.user.roles && this.$store.state.user.roles[role] === true
    },
    $dateFormat(date) {
      const d = dayjs(date)
      return d.format('D MMM YY')
    }
  }
})

app.mount('#app')
