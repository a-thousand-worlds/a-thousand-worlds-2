import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import dayjs from 'dayjs'
import CKEditor from '@ckeditor/ckeditor5-vue'

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
  // console.log('check access', to.meta.access)
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
app.directive('click-outside', {
  beforeMount(el, binding, vnode) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el)
      }
    }
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  }
})

app.mixin({
  methods: {
    $iam(role) {
      return this.$store.state.user.user?.roles?.[role] === true
    },
    $dateFormat(date) {
      const d = dayjs(date)
      return d.format('D MMM YY')
    }
  },
  computed: {
    $uiBusy() {
      return this.$store.state.ui.busy
    }
  }
})

app.mount('#app')
