import { addDays, format, parseISO } from "date-fns"
import type { UserListParams } from "@/store/api/cmsApi"

export type UserFilters = {
  roleId?: number
  isActive?: boolean
  lastLogin?: "signed-in" | "never"
  /** yyyy-MM-dd, inclusive on both ends. */
  joinedFrom?: string
  joinedTo?: string
}

export const NO_FILTERS: UserFilters = {}

export function activeFilterCount(filters: UserFilters) {
  return Object.values(filters).filter((value) => value !== undefined).length
}

/** The day after `date`, so an inclusive "joined to" covers that whole day. */
function dayAfter(date: string) {
  const parsed = parseISO(date)
  return Number.isNaN(parsed.getTime())
    ? undefined
    : format(addDays(parsed, 1), "yyyy-MM-dd")
}

/** Translate the panel's state into the `<field>_<operator>` params the API takes. */
export function filtersToParams(filters: UserFilters): Partial<UserListParams> {
  return {
    role_id: filters.roleId,
    is_active: filters.isActive,
    created_at_gte: filters.joinedFrom,
    // `lte` on a bare date stops at that day's midnight, so bound by the next day.
    created_at_lt: filters.joinedTo ? dayAfter(filters.joinedTo) : undefined,
    last_login_at_notnull: filters.lastLogin === "signed-in" || undefined,
    last_login_at_null: filters.lastLogin === "never" || undefined,
  }
}
