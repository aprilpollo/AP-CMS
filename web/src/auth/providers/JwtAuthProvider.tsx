import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react"
import {
  type AuthProviderComponentProps,
  type AuthProviderState,
  type AuthProviderMethods,
} from "../types/AuthTypes"
import type { User } from "@/auth/user"
import { isTokenValid } from "../utils/jwtUtils"
import { authSignIn, authRefresh, authLogout } from "../api/authApi"
import { loadAuthenticatedUser } from "../utils/loadAuthenticatedUser"
import { removeGlobalHeaders, setGlobalHeaders } from "@/utils/apiFetch"
import AuthContext, { type AuthContextType } from "../context/JwtAuthContext"
import useLocalStorage from "@/hooks/useLocalStorage"

export type SignInPayload = {
  email: string
  password: string
}

const JwtAuthProvider = forwardRef<
  AuthProviderMethods<User>,
  AuthProviderComponentProps
>((props, ref) => {
  const { children, onAuthStateChanged } = props

  const {
    value: storedAccessToken,
    setValue: setStoredAccessToken,
    removeValue: removeStoredAccessToken,
    getValue: getStoredAccessToken,
  } = useLocalStorage<string>("access_token")

  const {
    value: storedRefreshToken,
    setValue: setStoredRefreshToken,
    removeValue: removeStoredRefreshToken,
    getValue: getStoredRefreshToken,
  } = useLocalStorage<string>("refresh_token")

  const [authState, setAuthState] = useState<AuthProviderState<User>>({
    authStatus: "configuring",
    isAuthenticated: false,
    user: null,
  })

  const refreshingRef = useRef<Promise<string | null> | null>(null)

  useEffect(() => {
    if (onAuthStateChanged) {
      onAuthStateChanged(authState)
    }
  }, [authState, onAuthStateChanged])

  const performRefresh = useCallback(
    async (token: string): Promise<string | null> => {
      try {
        const res = await authRefresh(token)
        const data = (await res.json()) as {
          code: number
          error: string | null
          message: string
          payload: { access_token: string; token_type: string; expires_in: number }
        }
        const newAccessToken = data.payload.access_token
        setStoredAccessToken(newAccessToken)
        setGlobalHeaders({ Authorization: `Bearer ${newAccessToken}` })
        return newAccessToken
      } catch {
        return null
      }
    },
    [setStoredAccessToken]
  )

  useEffect(() => {
    const attemptAutoLogin = async () => {
      const accessToken = storedAccessToken
      const refreshToken = storedRefreshToken

      if (isTokenValid(accessToken)) {
        try {
          setGlobalHeaders({ Authorization: `Bearer ${accessToken!}` })
          const userData = await loadAuthenticatedUser(accessToken!)
          return userData
        } catch {
          // fall through to refresh
        }
      }

      if (refreshToken) {
        const newToken = await performRefresh(refreshToken)
        if (newToken) {
          try {
            const userData = await loadAuthenticatedUser(newToken)
            return userData
          } catch {
            return null
          }
        }
      }

      return null
    }

    if (!authState.isAuthenticated) {
      attemptAutoLogin().then((userData) => {
        if (userData) {
          setAuthState({
            authStatus: "authenticated",
            isAuthenticated: true,
            user: userData,
          })
        } else {
          removeStoredAccessToken()
          removeStoredRefreshToken()
          removeGlobalHeaders(["Authorization"])
          setAuthState({
            authStatus: "unauthenticated",
            isAuthenticated: false,
            user: null,
          })
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.isAuthenticated])

  const signIn = useCallback(
    async (credentials: SignInPayload) => {
      const response = await authSignIn(credentials)

      const session = (await response.json()) as {
        code: number
        error: string | null
        message: string
        payload: {
          access_token: string
          refresh_token: string
          token_type: string
          expires_in: number
        }
      }

      const { access_token, refresh_token } = session.payload
      const userData = await loadAuthenticatedUser(access_token)

      setStoredAccessToken(access_token)
      setStoredRefreshToken(refresh_token)
      setGlobalHeaders({ Authorization: `Bearer ${access_token}` })

      setAuthState({
        authStatus: "authenticated",
        isAuthenticated: true,
        user: userData,
      })

      return response
    },
    [setStoredAccessToken, setStoredRefreshToken]
  )

  const signOut: AuthContextType["signOut"] = useCallback(() => {
    const refreshToken = getStoredRefreshToken()
    if (refreshToken) {
      authLogout(refreshToken).catch(() => {})
    }
    removeStoredAccessToken()
    removeStoredRefreshToken()
    removeGlobalHeaders(["Authorization"])
    setAuthState({
      authStatus: "unauthenticated",
      isAuthenticated: false,
      user: null,
    })
  }, [removeStoredAccessToken, removeStoredRefreshToken, getStoredRefreshToken])

  useImperativeHandle(
    ref,
    () => ({
      signOut,
      updateUser: async () => {
        throw new Error("updateUser is not implemented for JwtAuthProvider")
      },
    }),
    [signOut]
  )

  const setUser = useCallback((newUser: User) => {
    setAuthState((prev) => ({ ...prev, user: newUser }))
  }, [])

  const authContextValue = useMemo(
    () =>
      ({
        ...authState,
        signIn,
        signOut,
        setUser,
      }) as AuthContextType,
    [authState, signIn, signOut, setUser]
  )

  useEffect(() => {
    if (!authState.isAuthenticated) return

    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      const response = await originalFetch(...args)

      if (response.status === 401) {
        const refreshToken = getStoredRefreshToken()

        if (!refreshToken) {
          signOut()
          return response
        }

        if (!refreshingRef.current) {
          refreshingRef.current = performRefresh(refreshToken).finally(() => {
            refreshingRef.current = null
          })
        }

        const newToken = await refreshingRef.current

        if (newToken) {
          const [resource, config] = args
          return originalFetch(resource, {
            ...(config as RequestInit),
            headers: {
              ...(config as RequestInit)?.headers,
              Authorization: `Bearer ${newToken}`,
            },
          })
        }

        signOut()
      }

      return response
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [authState.isAuthenticated, getStoredRefreshToken, performRefresh, signOut])

  return <AuthContext value={authContextValue}>{children}</AuthContext>
})

export default JwtAuthProvider
