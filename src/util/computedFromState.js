import { computed } from 'vue'
import store from '@/store'

/** Returns a computed function that  */
const computedFromState = (selector, defaultValue) => computed(() => selector(store.state))

export default computedFromState
