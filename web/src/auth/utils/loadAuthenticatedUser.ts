import type { User } from "@/auth/user"
import { authProfile } from "../api/authApi"

type ApiResponse<T> = {
  code: number
  error: string | null
  message: string
  payload: T
}

type MePayload = {
  user: Omit<User, "permissions">
  permissions: string[]
}

export async function loadAuthenticatedUser(token: string): Promise<User> {
  const res = await authProfile(token)
  const { payload } = (await res.json()) as ApiResponse<MePayload>
  return {
    ...payload.user,
    permissions: payload.permissions,
  }
}
