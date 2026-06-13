import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import type { PartialDeep } from "type-fest";
import { type User } from "@/auth/user";
import {
  type AuthProviderType,
  type AuthProviderMethods,
  type AuthProviderState,
} from "../types/AuthTypes";
import { type AuthState, initialAuthState } from "../context/AuthContext";
import AuthContext from "../context/AuthContext";
import Loading from "@/shared/Loading";

const authProviderLocalStorageKey = "auth-provider";

type AuthenticationProviderProps = {
  children: (authState: AuthProviderState | null) => React.ReactNode;
  providers: AuthProviderType[];
  onAuthStateChanged?: (authState: AuthProviderState) => void;
};

function AuthProvider(props: AuthenticationProviderProps) {
  const { children, providers, onAuthStateChanged } = props;

  const [authState, setAuthState] = useState<AuthState | null>(
    initialAuthState
  );

  const currentAuthStatus = useMemo(() => authState?.authStatus, [authState]);
  const [isLoading, setIsLoading] = useState(true);

  const [providerStatuses, setProviderStatuses] = useState<
    Record<string, string>
  >({});
  const providerRefs = useRef<Record<string, AuthProviderMethods | null>>({});
  const currentProvider = useMemo(
    () =>
      authState?.provider ? providerRefs.current[authState.provider] : null,
    [authState]
  );

  const allProvidersReady = useMemo(() => {
    return providers.every(
      (provider) =>
        providerStatuses[provider.name] &&
        providerStatuses[provider.name] !== "configuring"
    );
  }, [providers, providerStatuses]);

  const getAuthProvider = useCallback(() => {
    return localStorage.getItem(authProviderLocalStorageKey);
  }, []);

  const setAuthProvider = useCallback((authProvider: string) => {
    if (authProvider) {
      localStorage.setItem(authProviderLocalStorageKey, authProvider);
    }
  }, []);

  const resetAuthProvider = useCallback(() => {
    localStorage.removeItem(authProviderLocalStorageKey);
  }, []);

  const handleAuthStateChange = useCallback(
    (providerAuthState: AuthProviderState, name: string) => {
      setProviderStatuses((prevStatuses) => ({
        ...prevStatuses,
        [name]: providerAuthState.authStatus,
      }));
      setAuthState((prev) => {
        if (!prev) {
          if (providerAuthState.isAuthenticated && providerAuthState.user) {
            setAuthProvider(name);
            return { ...providerAuthState, provider: name };
          }
          return initialAuthState;
        }

        if (prev.provider === name && !providerAuthState.isAuthenticated) {
          return initialAuthState;
        }

        if (prev.isAuthenticated && !providerAuthState.isAuthenticated) {
          return prev;
        }

        if (
          !prev.isAuthenticated &&
          providerAuthState.isAuthenticated &&
          providerAuthState.user
        ) {
          setAuthProvider(name);
          return { ...providerAuthState, provider: name };
        }

        if (
          prev.authStatus === "configuring" &&
          providerAuthState.authStatus === "unauthenticated"
        ) {
          return {
            ...prev,
            authStatus: "unauthenticated",
          };
        }

        if (
          prev.isAuthenticated &&
          providerAuthState.isAuthenticated &&
          prev.provider === name &&
          providerAuthState.user &&
          JSON.stringify(prev.user) !== JSON.stringify(providerAuthState.user)
        ) {
          return { ...providerAuthState, provider: name };
        }

        return prev;
      });
    },
    [setAuthProvider]
  );

  useEffect(() => {
    if (onAuthStateChanged && authState) {
      onAuthStateChanged(authState);
    }
  }, [onAuthStateChanged, authState]);

  useEffect(() => {
    setIsLoading(!(allProvidersReady && currentAuthStatus !== "configuring"));
  }, [allProvidersReady, currentAuthStatus, providerStatuses]);

  const signOut = useCallback(() => {
    if (currentProvider) {
      currentProvider?.signOut();
      resetAuthProvider();
    } else {
      // eslint-disable-next-line no-console
      console.warn("No current auth provider to sign out from");
    }
  }, [currentProvider, resetAuthProvider]);

  const updateUser = useCallback(
    async (_userData: PartialDeep<User>) => {
      if (currentProvider?.updateUser) {
        return currentProvider?.updateUser(_userData);
      }

      throw new Error("No current auth provider to updateUser from");
    },
    [currentProvider]
  );

  const contextValue = useMemo(
    () => ({
      isAuthenticated: authState?.isAuthenticated,
      getAuthProvider,
      setAuthProvider,
      resetAuthProvider,
      providers,
      signOut,
      updateUser,
      authState,
    }),
    [
      authState,
      getAuthProvider,
      setAuthProvider,
      resetAuthProvider,
      providers,
      signOut,
      updateUser,
    ]
  );

  const nestedProviders = useMemo(
    () =>
      providers.reduceRight(
        (acc, { Provider, name }) => {
          return (
            <Provider
              key={name}
              ref={(ref: AuthProviderMethods | null) => {
                providerRefs.current[name] = ref;
              }}
              onAuthStateChanged={(authState) => {
                handleAuthStateChange(authState, name);
              }}
            >
              {acc}
            </Provider>
          );
        },
        !isLoading ? children(authState) : <Loading />
      ),
    [providers, isLoading, handleAuthStateChange, children, authState]
  );

  return <AuthContext value={contextValue}>{nestedProviders}</AuthContext>;
}

export default AuthProvider;
