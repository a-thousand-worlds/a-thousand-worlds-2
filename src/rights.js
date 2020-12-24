/** Declarative granular rights for different roles.
 *
 * - Multiple roles are OR'd together
 * - Must be compatible with firebase.rules.json
 * - superadmin has all rights.
 */
module.exports = {
  invite: ['admin'],
  manageCollections: [],
  editContent: [],
  review: ['admin'],
  submit: ['admin', 'contributor'],
  viewDashboard: ['admin', 'contributor', 'creator'],
}
