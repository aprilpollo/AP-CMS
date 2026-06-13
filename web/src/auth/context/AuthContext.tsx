import { createContext } from "react";
import {
  type AuthProviderState,
  type AuthProviderType,
} from "../types/AuthTypes";
import type { PartialDeep } from "type-fest";
import { type User } from "@/auth/user";

export type AuthState = AuthProviderState & {
  provider: string | null;
};

// eslint-disable-next-line react-refresh/only-export-components
export const initialAuthState: AuthState = {
  authStatus: "configuring",
  isAuthenticated: false,
  user: null,
  provider: null,
};

export type AuthContextType = {
  updateUser?: (U: PartialDeep<User>) => Promise<Response>;
  signOut?: () => void;
  authState: AuthProviderState | null;
  providers: AuthProviderType[];
};

const AuthContext = createContext<AuthContextType>({
  authState: initialAuthState,
  providers: [],
});

export default AuthContext;
