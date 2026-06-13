import React from "react";
import type { PartialDeep } from "type-fest";
import { type AuthUser } from "./AuthUser";

export type AuthProviderMethods<T = AuthUser> = {
  signOut: () => void;
  updateUser: (U: PartialDeep<T>) => Promise<Response>;
};

export type AuthProviderComponentProps = React.PropsWithChildren<{
  onAuthStateChanged?: (T: AuthProviderState) => void;
}> &
  React.RefAttributes<AuthProviderMethods>;

export type AuthProviderComponentType =
  React.ForwardRefExoticComponent<AuthProviderComponentProps>;

export type AuthProviderState<T = Record<string, unknown>> = {
  authStatus: "configuring" | "authenticated" | "unauthenticated";
  isAuthenticated: boolean;
  user: AuthUser<T> | null;
};

export type AuthProviderType = {
  name: string;
  Provider:
    | React.ComponentType<AuthProviderComponentProps>
    | React.ForwardRefExoticComponent<AuthProviderComponentProps>;
};
