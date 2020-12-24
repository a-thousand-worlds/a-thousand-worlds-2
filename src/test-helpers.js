import { render as vueRender } from '@testing-library/vue'
import store from '@/store'
import mixins from '@/mixins'
import directives from '@/directives'

export const render = component => vueRender(component, {
  global: {
    directives,
    mixins: [mixins],
    plugins: [store]
  }
})
