import apiFetch from "@/utils/apiFetch"

export async function getMedia(query?: string): Promise<Response> {
  return apiFetch(`/api/v1/media${query ? `?${query}` : ''}`)
}