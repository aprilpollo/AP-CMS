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
  UserAccount,
  UserRole,
  UserSession,
  AuditRecord,
  Permission,
  Role,
} from "@/types/cms"

const api = apiService.enhanceEndpoints({
  addTagTypes: [
    "Post",
    "Category",
    "Tag",
    "Revision",
    "Media",
    "User",
    "Role",
    "Permission",
    "Session",
    "Activity",
  ],
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
  mime_type_in?: string
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

export type UserListParams = {
  search?: string
  role_id?: number
  is_active?: boolean
  created_at_gte?: string
  created_at_lt?: string
  last_login_at_null?: boolean
  last_login_at_notnull?: boolean
  _page?: number
  _limit?: number
  _sort?: string
  _order?: "ASC" | "DESC"
}

export type UserListResult = {
  items: UserAccount[]
  pagination?: Pagination
}

export type CreateUserBody = {
  email: string
  display_name: string
  first_name: string
  last_name: string
  bio?: string
  role_id: number
  password: string
  is_active?: boolean
}

export type UpdateUserBody = {
  email?: string
  display_name?: string
  first_name?: string
  last_name?: string
  bio?: string
  role_id?: number
  is_active?: boolean
}

/**
 * Role writes change the role list, the master lookup used by user forms, and
 * the role badge rendered on every user row.
 */
const ROLE_TAGS = [
  { type: "Role" as const, id: "DETAILED" },
  { type: "Role" as const, id: "LIST" },
  { type: "User" as const, id: "LIST" },
]

export type RoleBody = {
  name?: string
  slug?: string
  color?: string
}

export type CreateRoleBody = RoleBody & {
  name: string
  permission_ids?: number[]
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
        params: arg && arg.search ? { name_contains: arg.search } : undefined,
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

    listUsers: build.query<UserListResult, UserListParams>({
      // The API only supports `<field>_<operator>` filters (ANDed, no OR), so a
      // single search box has to pick one field: e-mail when the query looks
      // like one, display name otherwise.
      query: ({ search, ...rest }) => {
        const params: Record<string, string | number | boolean> = { ...rest }
        const term = search?.trim()
        if (term) {
          if (term.includes("@")) params.email_contains = term
          else params.display_name_contains = term
        }
        return { url: "/api/v1/users", params }
      },
      transformResponse: (res: ApiEnvelope<UserAccount[]>) => ({
        items: res.payload ?? [],
        pagination: res.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((u) => ({ type: "User" as const, id: u.id })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    getUser: build.query<UserAccount, number | string>({
      query: (id) => `/api/v1/users/${id}`,
      transformResponse: (res: ApiEnvelope<UserAccount>) => res.payload,
      providesTags: (result) =>
        result ? [{ type: "User", id: result.id }] : [],
    }),

    createUser: build.mutation<UserAccount, CreateUserBody>({
      query: (body) => ({ url: "/api/v1/users", method: "POST", body }),
      transformResponse: (res: ApiEnvelope<UserAccount>) => res.payload,
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: build.mutation<
      { message: string },
      { id: number | string; body: UpdateUserBody }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/users/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: ApiEnvelope<{ message: string }>) => res.payload,
      invalidatesTags: (_r, _e, arg) => [
        { type: "User", id: arg.id },
        { type: "User", id: "LIST" },
      ],
    }),

    setUserPassword: build.mutation<
      { message: string },
      { id: number | string; password: string }
    >({
      query: ({ id, password }) => ({
        url: `/api/v1/users/${id}/password`,
        method: "PUT",
        body: { password },
      }),
      transformResponse: (res: ApiEnvelope<{ message: string }>) => res.payload,
    }),

    deleteUser: build.mutation<{ message: string }, number | string>({
      query: (id) => ({ url: `/api/v1/users/${id}`, method: "DELETE" }),
      transformResponse: (res: ApiEnvelope<{ message: string }>) => res.payload,
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    checkEmailAvailable: build.query<
      { email: string; available: boolean },
      string
    >({
      query: (email) => ({
        url: "/api/v1/users/email-available",
        params: { email },
      }),
      transformResponse: (
        res: ApiEnvelope<{ email: string; available: boolean }>
      ) => res.payload,
    }),

    listUserSessions: build.query<UserSession[], number | string>({
      query: (id) => `/api/v1/users/${id}/sessions`,
      transformResponse: (res: ApiEnvelope<UserSession[]>) => res.payload ?? [],
      providesTags: (_r, _e, id) => [{ type: "Session", id }],
    }),

    revokeUserSession: build.mutation<
      { message: string },
      { id: number | string; sessionId: string }
    >({
      query: ({ id, sessionId }) => ({
        url: `/api/v1/users/${id}/sessions/${sessionId}`,
        method: "DELETE",
      }),
      transformResponse: (res: ApiEnvelope<{ message: string }>) => res.payload,
      invalidatesTags: (_r, _e, arg) => [{ type: "Session", id: arg.id }],
    }),

    listUserActivity: build.query<
      AuditRecord[],
      { id: number | string; limit?: number }
    >({
      query: ({ id, limit = 20 }) => ({
        url: `/api/v1/users/${id}/activity`,
        params: { _limit: limit },
      }),
      transformResponse: (res: ApiEnvelope<AuditRecord[]>) => res.payload ?? [],
      providesTags: (_r, _e, arg) => [{ type: "Activity", id: arg.id }],
    }),

    uploadUserAvatar: build.mutation<
      { avatar_url: string },
      { id: number | string; file: File }
    >({
      query: ({ id, file }) => {
        const form = new FormData()
        form.append("file", file)
        return { url: `/api/v1/users/${id}/avatar`, method: "POST", body: form }
      },
      transformResponse: (res: ApiEnvelope<{ avatar_url: string }>) =>
        res.payload,
      invalidatesTags: (_r, _e, arg) => [
        { type: "User", id: arg.id },
        { type: "User", id: "LIST" },
      ],
    }),

    sendUserInvite: build.mutation<{ message: string }, number | string>({
      query: (id) => ({ url: `/api/v1/users/${id}/invite`, method: "POST" }),
      transformResponse: (res: ApiEnvelope<{ message: string }>) => res.payload,
    }),

    listRoles: build.query<UserRole[], void>({
      query: () => ({ url: "/api/v1/masters/roles", params: { _limit: 100 } }),
      transformResponse: (res: ApiEnvelope<UserRole[]>) => res.payload ?? [],
      providesTags: [{ type: "Role", id: "LIST" }],
    }),

    /** Roles with their permission set — needs the "roles.manage" permission. */
    listRolesDetailed: build.query<Role[], void>({
      query: () => ({
        url: "/api/v1/roles",
        params: { _limit: 100, _sort: "id", _order: "ASC" },
      }),
      transformResponse: (res: ApiEnvelope<Role[]>) => res.payload ?? [],
      providesTags: [{ type: "Role", id: "DETAILED" }],
    }),

    listPermissions: build.query<Permission[], void>({
      query: () => ({
        url: "/api/v1/roles/permissions",
        params: { _limit: 200, _sort: "slug", _order: "ASC" },
      }),
      transformResponse: (res: ApiEnvelope<Permission[]>) => res.payload ?? [],
      providesTags: [{ type: "Permission", id: "LIST" }],
    }),

    createRole: build.mutation<Role, CreateRoleBody>({
      query: (body) => ({ url: "/api/v1/roles", method: "POST", body }),
      transformResponse: (res: ApiEnvelope<Role>) => res.payload,
      invalidatesTags: ROLE_TAGS,
    }),

    updateRole: build.mutation<Role, { id: number; body: RoleBody }>({
      query: ({ id, body }) => ({
        url: `/api/v1/roles/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (res: ApiEnvelope<Role>) => res.payload,
      invalidatesTags: ROLE_TAGS,
    }),

    setRolePermissions: build.mutation<
      Role,
      { id: number; permission_ids: number[] }
    >({
      query: ({ id, permission_ids }) => ({
        url: `/api/v1/roles/${id}/permissions`,
        method: "PUT",
        body: { permission_ids },
      }),
      transformResponse: (res: ApiEnvelope<Role>) => res.payload,
      invalidatesTags: [{ type: "Role", id: "DETAILED" }],
    }),

    deleteRole: build.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/api/v1/roles/${id}`, method: "DELETE" }),
      transformResponse: (res: ApiEnvelope<{ message: string }>) => res.payload,
      invalidatesTags: ROLE_TAGS,
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
        url: "/api/v1/media",
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
  useListUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSetUserPasswordMutation,
  useListRolesQuery,
  useListRolesDetailedQuery,
  useListPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useSetRolePermissionsMutation,
  useDeleteRoleMutation,
  useCheckEmailAvailableQuery,
  useListUserSessionsQuery,
  useRevokeUserSessionMutation,
  useListUserActivityQuery,
  useUploadUserAvatarMutation,
  useSendUserInviteMutation,
  useListTagsQuery,
  useDeleteTagMutation,
  useListMediaQuery,
  useUploadMediaMutation,
} = cmsApi
