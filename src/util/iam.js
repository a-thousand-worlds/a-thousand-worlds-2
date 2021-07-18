/** Returns true if the logged in user has a specific role. May be impersonated by owners. */
const iam = (state, role) =>
  role !== 'authorized' && state.user?.impersonate
    ? state.user?.impersonate === role
    : state.user?.user?.roles?.[role]

export default iam
