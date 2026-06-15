import { type SettingsConfigType } from "@/settings/context/SettingsContext"
import { type AuthUser } from "../types/AuthUser"
import type { PartialDeep } from "type-fest"

export type Role = {
  id: number
  name: string
  slug: string
}

export type User = AuthUser & {
  id: string
  email: string
  display_name: string
  first_name: string
  last_name: string
  bio?: string
  role_id: number
  role: Role
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  permissions: string[]
  settings?: PartialDeep<SettingsConfigType>
  loginRedirectUrl?: string
}
