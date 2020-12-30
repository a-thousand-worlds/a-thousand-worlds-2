import { rights } from '@/rights'
import iam from './iam'

/** Returns true if the logged in user can perform the specified action, based on rights.js. */
const can = (state, actionName) => {
  if (!(actionName in rights)) {
    throw new Error(`Unrecognized action name: "${actionName}"`)
  }
  if (iam(state, 'owner')) return true
  return rights[actionName].some(role => iam(state, role))
}

export default can
