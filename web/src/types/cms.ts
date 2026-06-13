import type { Pagination } from "@/types"

export type ApiEnvelope<T> = {
  code: number
  message: string
  error: string | null
  payload: T
  pagination?: Pagination
}

export type PostStatus = "draft" | "published" | "archived"
export type PostType = "post" | "page" | "custom"
export type ContentFormat = "markdown" | "blocks"

export type Author = {
  id: string
  avatar_url?: string | null
  email: string
  display_name?: string | null
  role?: { id: number; name: string; slug: string }
}

export type Category = {
  id: string
  parent_id?: string | null
  name: string
  slug: string
  description?: string | null
  sort_order: number
  children?: Category[]
}

export type Tag = {
  id: string
  name: string
  slug: string
  post_count?: number
}

export type Post = {
  id: string
  title: string
  slug: string
  content?: string | null
  content_format: ContentFormat
  excerpt?: string | null
  status: PostStatus
  type: PostType
  featured_image_url?: string | null
  reading_time_min?: number | null
  author_id?: string | null
  author?: Author | null
  categories?: Category[]
  tags?: Tag[]
  published_at?: string | null
  created_at: string
  updated_at: string
}

export type Media = {
  id: string
  uploader_id?: string | null
  filename: string
  original_name: string
  mime_type: string
  url: string
  storage_provider: string
  size_bytes: number
  width?: number | null
  height?: number | null
  alt_text?: string | null
  created_at: string
}

export type PostRevision = {
  id: number
  post_id: string
  editor_id?: string | null
  content?: string | null
  content_format: string
  revision_note?: string | null
  created_at: string
}

export type { Pagination }
