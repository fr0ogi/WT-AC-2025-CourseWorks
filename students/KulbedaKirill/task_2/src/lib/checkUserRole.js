export const checkUserRole = (role) => {
  const allowedRoles = ['admin', 'user', 'agent']

  if (!allowedRoles.includes(role)) {
    throw new Error(`Invalid role! current role: ${role}`)
  }
}
