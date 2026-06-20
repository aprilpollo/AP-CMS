import apiFetch from "@/utils/apiFetch"

export async function getCategories(query?: string): Promise<Response> {
  return apiFetch(`/api/v1/categories${query ? `?${query}` : ''}`)
}