/** Declarative granular rights for different roles.
 *
 * - Multiple roles are OR'd together
 * - Must be compatible with firebase.rules.json
 * - superadmin has all rights.
 */

export const rights = {
  invite: ['admin', 'contributor', 'creator'],
  manageCollections: [],
  manageInvites: [],
  editContent: [],
  review: ['admin'],
  submit: ['admin', 'contributor'],
  viewDashboard: ['admin', 'contributor', 'creator'],
}

export const allowedInvitees = {
  user: ['contributor', 'creator', 'admin'],
  contributor: ['admin'],
  creator: ['admin'],
  admin: ['admin'],
  superadmin: [],
}
