type AuthArr = string[] | string | undefined | null
type UserRole = string[] | string | null

export function hasPermission(authArr: AuthArr, userRole: UserRole): boolean {
  if (authArr === null || authArr === undefined) {
    return true
  }

  if (Array.isArray(authArr) && authArr.length === 0) {
    return (
      !userRole ||
      (Array.isArray(userRole) && userRole.length === 0) ||
      (typeof userRole === "string" && userRole.length === 0)
    )
  }

  if (userRole && Array.isArray(authArr) && Array.isArray(userRole)) {
    return authArr.some((r) => userRole.indexOf(r) >= 0)
  }

  if (typeof userRole === "string" && Array.isArray(authArr)) {
    return authArr.includes(userRole)
  }

  return false
}
