import apiFetch from "@/utils/apiFetch"

export async function authSignIn(credentials: {
  email: string
  password: string
}): Promise<Response> {
  return apiFetch("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  })
}

export async function authRefresh(refreshToken: string): Promise<Response> {
  return apiFetch("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export async function authLogout(refreshToken: string): Promise<Response> {
  return apiFetch("/api/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export async function authProfile(accessToken: string): Promise<Response> {
  return apiFetch("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function authForgotPassword(email: string): Promise<Response> {
  return apiFetch("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function authResetPassword(
  token: string,
  newPassword: string
): Promise<Response> {
  return apiFetch("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  })
}

export async function authVerifyEmail(token: string): Promise<Response> {
  return apiFetch("/api/v1/users/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  })
}
