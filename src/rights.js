/** Declarative granular rights for different roles.
 *
 * - Multiple roles are OR'd together
 * - Must be compatible with firebase.rules.json
 * - owner has all rights.
 */

export const rights = {
  invite: ['advisor', 'contributor', 'creator'],
  manageCollections: [],
  manageInvites: [],
  editContent: [],
  review: ['advisor'],
  submit: ['advisor', 'contributor'],
  viewDashboard: ['advisor', 'contributor', 'creator'],
}

export const allowedInvitees = {
  user: ['contributor', 'creator', 'advisor'],
  contributor: ['advisor'],
  creator: ['advisor'],
  advisor: ['advisor'],
  owner: [],
}
