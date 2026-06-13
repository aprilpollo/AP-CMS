import apiFetch from "@/utils/apiFetch"

export async function updateProfile(data: {
  first_name: string
  last_name: string
  display_name: string
  bio: string
}): Promise<Response> {
  return apiFetch(`/api/v1/users/me`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function updateAvatar(file: File): Promise<Response> {
  const formData = new FormData()
  formData.append("avatar", file)

  return apiFetch(`/api/v1/users/me/avatar`, {
    method: "POST",
    body: formData,
  })
}

export async function searchUsers(query: string): Promise<Response> {
  return apiFetch(`/api/v1/users/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
  })
}