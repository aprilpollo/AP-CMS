import apiFetch from "@/utils/apiFetch"

export type CreatePostBody = {
  title: string
  slug?: string
  content?: string
  content_format?: "markdown" | "blocks"
  excerpt?: string
  type?: "post" | "page" | "custom"
  category_ids?: number[]
  tags?: string[]
  featured_image_url?: string
}

export type UpdatePostBody = {
  title?: string
  content?: string
  content_format?: "markdown" | "blocks"
  excerpt?: string
  category_ids?: number[]
  tags?: string[]
  featured_image_url?: string
}

export function getPosts(query?: string) {
  return apiFetch(`/api/v1/posts${query ? `?${query}` : ""}`)
}

export function getPostBySlug(slug: string) {
  return apiFetch(`/api/v1/posts/${slug}`)
}

export function createPost(body: CreatePostBody) {
  return apiFetch("/api/v1/posts", { method: "POST", body: JSON.stringify(body) })
}

export function updatePost(id: string | number, body: UpdatePostBody) {
  return apiFetch(`/api/v1/posts/${id}`, { method: "PUT", body: JSON.stringify(body) })
}

export function changePostStatus(id: string | number, status: string) {
  return apiFetch(`/api/v1/posts/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

export function deletePost(id: string | number) {
  return apiFetch(`/api/v1/posts/${id}`, { method: "DELETE" })
}

export function listRevisions(postId: string | number) {
  return apiFetch(`/api/v1/posts/${postId}/revisions`)
}

export function restoreRevision(postId: string | number, revisionId: number) {
  return apiFetch(`/api/v1/posts/${postId}/revisions/${revisionId}/restore`, { method: "POST" })
}
