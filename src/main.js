import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

require('@/assets/main.scss')

// eslint-disable-next-line
//import FontAwesomeIcon from './fontawesome'

createApp(App)
  .use(store)
  .use(router)
  // .component('fai',FontAwesomeIcon)
  .mount('#app')
