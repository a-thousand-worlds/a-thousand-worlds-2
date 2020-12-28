import { allowedInvitees } from '@/rights'
import iam from './iam'

/** Returns a list of roles the logged in user can invite. Reads from rights.js. */
const allowedInviteeRoles = state => {
  return ['user', 'contributor', 'creator', 'admin', 'superadmin']
    .filter(role => {
      if (iam(state, 'superadmin')) return true
      return allowedInvitees[role].some(allowedRole => iam(state, allowedRole))
    })
}

export default allowedInviteeRoles
