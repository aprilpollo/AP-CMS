import apiFetch from "@/utils/apiFetch"

export async function getTags(query?: string): Promise<Response> {
  return apiFetch(`/api/v1/tags${query ? `?${query}` : ''}`)
}