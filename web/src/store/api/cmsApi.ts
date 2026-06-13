import apiService from "@/store/apiService"
import type { Pagination } from "@/types"
import type {
  ApiEnvelope,
  Category,
  ContentFormat,
  Media,
  Post,
  PostRevision,
  PostType,
  Tag,
} from "@/types/cms"

const api = apiService.enhanceEndpoints({
  addTagTypes: ["Post", "Category", "Tag", "Revision", "Media"],
})

export type PostListParams = {
  status?: string
  type?: string
  category_id?: string
  author_id?: string
  tag?: string
  search?: string
  _limit?: number
  _offset?: number
  _sort?: string
  _order?: "ASC" | "DESC"
}

export type PostListResult = {
  items: Post[]
  pagination?: Pagination
}

export type MediaListParams = {
  mime_type?: string
  _limit?: number
  _offset?: number
}

export type MediaListResult = {
  items: Media[]
  pagination?: Pagination
}

export type CreateCategoryBody = {
  name: string
  slug?: string
  parent_id?: string | null
  description?: string
  sort_order?: number
}

export type CategoryListParams = {
  search?: string
}

export type PostBody = {
  title?: string
  content?: string
  content_format?: ContentFormat
  excerpt?: string
  type?: PostType
  category_ids?: number[]
  tags?: string[]
  featured_image_url?: string
}

export const cmsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listPosts: build.query<PostListResult, PostListParams>({
      query: (params) => ({ url: "/api/v1/posts", params }),
      transformResponse: (res: ApiEnvelope<Post[]>) => ({
        items: res.payload ?? [],
        pagination: res.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((p) => ({ type: "Post" as const, id: p.id })),
              { type: "Post" as const, id: "LIST" },
            ]
          : [{ type: "Post" as const, id: "LIST" }],
    }),

    getPost: build.query<Post, string>({
      query: (slug) => `/api/v1/posts/${slug}`,
      transformResponse: (res: ApiEnvelope<Post>) => res.payload,
      providesTags: (result) =>
        result ? [{ type: "Post", id: result.id }] : [],
    }),

    createPost: build.mutation<Post, PostBody>({
      query: (body) => ({ url: "/api/v1/posts", method: "POST", body }),
      transformResponse: (res: ApiEnvelope<Post>) => res.payload,
      invalidatesTags: [
        { type: "Post", id: "LIST" },
        { type: "Tag", id: "LIST" },
      ],
    }),

    updatePost: build.mutation<Post, { id: string; body: PostBody }>({
      query: ({ id, body }) => ({
        url: `/api/v1/posts/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: ApiEnvelope<Post>) => res.payload,
      invalidatesTags: (_r, _e, arg) => [
        { type: "Post", id: arg.id },
        { type: "Post", id: "LIST" },
        { type: "Revision", id: arg.id },
        { type: "Tag", id: "LIST" },
      ],
    }),

    changePostStatus: build.mutation<Post, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/api/v1/posts/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (res: ApiEnvelope<Post>) => res.payload,
      invalidatesTags: (_r, _e, arg) => [
        { type: "Post", id: arg.id },
        { type: "Post", id: "LIST" },
      ],
    }),

    deletePost: build.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/posts/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),

    listRevisions: build.query<PostRevision[], string>({
      query: (id) => `/api/v1/posts/${id}/revisions`,
      transformResponse: (res: ApiEnvelope<PostRevision[]>) =>
        res.payload ?? [],
      providesTags: (_r, _e, id) => [{ type: "Revision", id }],
    }),

    restoreRevision: build.mutation<Post, { id: string; rid: number }>({
      query: ({ id, rid }) => ({
        url: `/api/v1/posts/${id}/revisions/${rid}/restore`,
        method: "POST",
      }),
      transformResponse: (res: ApiEnvelope<Post>) => res.payload,
      invalidatesTags: (_r, _e, arg) => [
        { type: "Post", id: arg.id },
        { type: "Revision", id: arg.id },
      ],
    }),

    listCategories: build.query<Category[], CategoryListParams | void>({
      // The API uses generic `<field>_<operator>` filters (no `search` param),
      // so map the search box to a case-insensitive name LIKE filter.
      query: (arg) => ({
        url: "/api/v1/categories",
        params:
          arg && arg.search ? { name_contains: arg.search } : undefined,
      }),
      transformResponse: (res: ApiEnvelope<Category[]>) => res.payload ?? [],
      providesTags: [{ type: "Category", id: "LIST" }],
    }),

    createCategory: build.mutation<Category, CreateCategoryBody>({
      query: (body) => ({ url: "/api/v1/categories", method: "POST", body }),
      transformResponse: (res: ApiEnvelope<Category>) => res.payload,
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    updateCategory: build.mutation<
      Category,
      { id: string; body: CreateCategoryBody }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/categories/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: ApiEnvelope<Category>) => res.payload,
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    deleteCategory: build.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/categories/${id}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "Category", id: "LIST" },
        { type: "Post", id: "LIST" },
      ],
    }),

    listTags: build.query<Tag[], void>({
      query: () => "/api/v1/tags",
      transformResponse: (res: ApiEnvelope<Tag[]>) => res.payload ?? [],
      providesTags: [{ type: "Tag", id: "LIST" }],
    }),

    deleteTag: build.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/tags/${id}`, method: "DELETE" }),
      invalidatesTags: [
        { type: "Tag", id: "LIST" },
        { type: "Post", id: "LIST" },
      ],
    }),

    listMedia: build.query<MediaListResult, MediaListParams>({
      query: (params) => ({ url: "/api/v1/media", params }),
      transformResponse: (res: ApiEnvelope<Media[]>) => ({
        items: res.payload ?? [],
        pagination: res.pagination,
      }),
      providesTags: [{ type: "Media", id: "LIST" }],
    }),

    uploadMedia: build.mutation<Media, FormData>({
      query: (body) => ({
        url: "/api/v1/media/upload",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiEnvelope<Media>) => res.payload,
      invalidatesTags: [{ type: "Media", id: "LIST" }],
    }),
  }),
})

export const {
  useListPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useChangePostStatusMutation,
  useDeletePostMutation,
  useListRevisionsQuery,
  useRestoreRevisionMutation,
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useListTagsQuery,
  useDeleteTagMutation,
  useListMediaQuery,
  useUploadMediaMutation,
} = cmsApi
