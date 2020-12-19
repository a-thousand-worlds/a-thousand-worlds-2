/** Returns true if the logged in user has a specific role. */
const iam = (state, role) =>
  state.user?.user?.roles?.[role]

export default iam
