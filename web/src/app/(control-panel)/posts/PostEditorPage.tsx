import { useCallback, useEffect,  useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import type { Option } from "@/components/ui/multiselect"
import type { Option as OptionCheckbox } from "@/components/combobox-multiple"
import RichTextEditor from "@/components/editor/RichTextEditor"
import type { Editor } from "@tiptap/react"
import MediaPickerDialog from "@/components/media/MediaPickerDialog"
import { apiError } from "@/utils/apiError"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  useChangePostStatusMutation,
  useCreatePostMutation,
  useDeletePostMutation,
  useGetPostQuery,
//   useListCategoriesQuery,
//   useListTagsQuery,
  useUpdatePostMutation,
  useListMediaQuery,
  useUploadMediaMutation,
  type PostBody,
  type MediaListParams,
} from "@/store/api/cmsApi"
import type { Media, Post } from "@/types/cms"
import { EditorToolbar } from "@/components/post/editor/EditorToolbar"
import { LeftPanel } from "@/components/post/editor/LeftPanel"
import { RightPanel } from "@/components/post/editor/RightPanel"
import { DeletePostDialog } from "@/components/post/editor/DeletePostDialog"

export default function PostEditorPage() {
  const { slug } = useParams()
  const isEdit = Boolean(slug)
  const navigate = useNavigate()

  const [mime, setMime] = useState("all")
  const [page, setPage] = useState(1)
  const [allMediaItems, setAllMediaItems] = useState<Media[]>([])

  const { data: post, isLoading: loadingPost } = useGetPostQuery(slug ?? "", {
    skip: !isEdit,
  })
//   const { data: categories = [] } = useListCategoriesQuery()

  const params: MediaListParams = {
    _limit: 10,
    _offset: (page - 1) * 10,
  }
  if (mime !== "all") params.mime_type_in = mime
  const { data: mediaData, isFetching: loadingMedia } = useListMediaQuery(params)
  const [upload, { isLoading: uploading }] = useUploadMediaMutation()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!mediaData?.items) return
    setAllMediaItems((prev) =>
      page === 1 ? mediaData.items : [...prev, ...mediaData.items]
    )
  }, [mediaData])

  const hasMore = !!mediaData?.pagination &&
    allMediaItems.length < mediaData.pagination.total

  function handleSetMime(newMime: string) {
    setMime(newMime)
    setPage(1)
    setAllMediaItems([])
  }

  const handleLoadMore = useCallback(() => {
    if (!loadingMedia && hasMore) setPage((p) => p + 1)
  }, [loadingMedia, hasMore])
  

//   const categoryOptions = useMemo<OptionCheckbox[]>(
//     () =>
//       categories.map((c) => ({
//         value: String(c.id),
//         label: c.name,
//         children: c.children?.map((ch) => ({
//           value: String(ch.id),
//           label: ch.name,
//         })),
//       })),
//     [categories]
//   )

//   const { data: tags = [] } = useListTagsQuery()
//   const tagOptions = useMemo<Option[]>(
//     () => tags.map((t) => ({ value: t.name, label: t.name })),
//     [tags]
//   )

  const [createPost, { isLoading: creating }] = useCreatePostMutation()
  const [updatePost, { isLoading: updating }] = useUpdatePostMutation()
  const [changeStatus, { isLoading: changing }] = useChangePostStatusMutation()
  const [deletePost] = useDeletePostMutation()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [categoryValues, setCategoryValues] = useState<OptionCheckbox[]>([])
  const [tagValues, setTagValues] = useState<Option[]>([])
  const [featured, setFeatured] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

  const [editor, setEditor] = useState<Editor | null>(null)

  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerResolve = useRef<((url: string | null) => void) | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  const pickImage = () =>
    new Promise<string | null>((resolve) => {
      pickerResolve.current = resolve
      setPickerOpen(true)
    })

  function handlePicked(media: Media) {
    pickerResolve.current?.(media.url)
    pickerResolve.current = null
    setPickerOpen(false)
  }

  function handlePickerOpenChange(open: boolean) {
    if (!open) {
      pickerResolve.current?.(null)
      pickerResolve.current = null
    }
    setPickerOpen(open)
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    let ok = 0
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append("file", file)
      try {
        await upload(fd).unwrap()
        ok++
      } catch (e) {
        toast.error(`${file.name}: ${apiError(e)}`)
      }
    }
    if (ok) toast.success(`Uploaded ${ok} file${ok > 1 ? "s" : ""}`)
    if (fileRef.current) fileRef.current.value = ""
    setPage(1)
  }

  function populate(p: Post) {
    setTitle(p.title)
    setContent(p.content ?? "")
    setExcerpt(p.excerpt ?? "")
    setCategoryValues(
      (p.categories ?? []).map((c) => ({ value: String(c.id), label: c.name }))
    )
    setTagValues((p.tags ?? []).map((t) => ({ value: t.name, label: t.name })))
    setFeatured(p.featured_image_url ?? "")
  }

  useEffect(() => {
    if (post) populate(post)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id])

  const saving = creating || updating || changing

  function buildBody(): PostBody {
    return {
      title: title.trim(),
      content: content || undefined,
      excerpt: excerpt || undefined,
      category_ids: categoryValues.map((o) => Number(o.value)),
      tags: tagValues.map((o) => o.value),
      featured_image_url: featured || undefined,
    }
  }

  async function save(publishAfter = false) {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }
    try {
      let saved: Post
      if (isEdit && post) {
        saved = await updatePost({
          id: String(post.id),
          body: buildBody(),
        }).unwrap()
      } else {
        saved = await createPost(buildBody()).unwrap()
      }
      if (publishAfter && saved.status !== "published") {
        saved = await changeStatus({
          id: String(saved.id),
          status: "published",
        }).unwrap()
      }
      toast.success(
        publishAfter ? "Published" : isEdit ? "Saved" : "Draft created"
      )
      if (!isEdit) navigate(`/posts/${saved.slug}/edit`, { replace: true })
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  async function setStatus(status: string) {
    if (!post) return
    try {
      await changeStatus({ id: String(post.id), status }).unwrap()
      toast.success(`Moved to ${status}`)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  async function doDelete() {
    if (!post) return
    try {
      await deletePost(String(post.id)).unwrap()
      toast.success("Post deleted")
      navigate("/posts")
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  if (isEdit && loadingPost)
    return (
      <div className="flex h-[calc(100dvh-48px)] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  if (isEdit && !post)
    return (
      <div className="flex h-[calc(100dvh-48px)] items-center justify-center">
        <p className="text-sm text-muted-foreground">Post not found.</p>
      </div>
    )

  return (
    <>
      <div className="flex h-[calc(100dvh-48px)] flex-col overflow-hidden">
        <EditorToolbar
          isEdit={isEdit}
          postStatus={post?.status}
          saving={saving}
          onBack={() => navigate("/posts")}
          onToggleLeft={() => setLeftOpen((v) => !v)}
          onToggleRight={() => setRightOpen((v) => !v)}
          onSaveDraft={() => save(false)}
          onPublish={() => save(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          <LeftPanel
            open={leftOpen}
            editor={editor}
            mediaItems={allMediaItems}
            uploading={uploading}
            fileRef={fileRef}
            onUpload={handleFiles}
            setMime={handleSetMime}
            hasMore={hasMore}
            loadingMedia={loadingMedia}
            onLoadMore={handleLoadMore}
          />

          {/* Center editor */}
         
            <ScrollArea className="flex-1">
              <div className="mx-auto max-w-5xl space-y-4 px-8 py-10">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add title"
                  className="w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/40 "
                />
                <div className="border-b" />
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  onPickImage={pickImage}
                  onEditorReady={setEditor}
                />
              </div>
            </ScrollArea>

          <RightPanel
            open={rightOpen}
            isEdit={isEdit}
            post={post}
            changing={changing}
            onSetStatus={setStatus}
            onDelete={() => setConfirmDelete(true)}
            onRestored={populate}
          />
        </div>
      </div>

      <DeletePostDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onDelete={doDelete}
      />

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={handlePickerOpenChange}
        onSelect={handlePicked}
      />
    </>
  )
}
