import { computed } from 'vue'
import store from '@/store'

// define selectors here since setup does not have access to computed
const computedFromState = f => computed(() => f(store.state))

export default computedFromState
