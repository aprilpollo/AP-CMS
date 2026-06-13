import { type AuthProviderState } from "../types/AuthTypes"
import { type User } from "@/auth/user"
import { createContext } from "react"
import { type SignInPayload } from "../providers/JwtAuthProvider"

export type AuthContextType = AuthProviderState<User> & {
  setUser: (user: User) => void
  signIn: (credentials: SignInPayload) => Promise<Response>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default AuthContext
