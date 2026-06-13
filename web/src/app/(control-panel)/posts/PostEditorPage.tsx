import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { format } from "date-fns"
import {
  ArrowLeft,
  Save,
  Send,
  Trash2,
  History,
  RotateCcw,
  Image,
} from "lucide-react"
import { toast } from "sonner"
import PageContainer from "@/shared/PageContainer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MultipleSelector, { type Option } from "@/components/ui/multiselect"
import {
  MultipleCheckbox,
  type Option as OptionCheckbox,
} from "@/components/combobox-multiple"
import RichTextEditor from "@/components/editor/RichTextEditor"
import MediaPickerDialog from "@/components/media/MediaPickerDialog"
import { StatusBadge } from "@/lib/cms"
import { apiError } from "@/utils/apiError"
import {
  useChangePostStatusMutation,
  useCreatePostMutation,
  useDeletePostMutation,
  useGetPostQuery,
  useListCategoriesQuery,
  useListRevisionsQuery,
  useListTagsQuery,
  useRestoreRevisionMutation,
  useUpdatePostMutation,
  type PostBody,
} from "@/store/api/cmsApi"
import type { Media, Post } from "@/types/cms"
import { cn } from "@/lib/utils"

function RevisionsCard({
  postId,
  onRestored,
}: {
  postId: string
  onRestored: (p: Post) => void
}) {
  const { data: revisions = [], isLoading } = useListRevisionsQuery(postId)
  const [restore, { isLoading: restoring }] = useRestoreRevisionMutation()

  async function doRestore(rid: number) {
    try {
      const p = await restore({ id: postId, rid }).unwrap()
      onRestored(p)
      toast.success("Revision restored")
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  return (
    <Card className="border-none bg-transparent ring-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-4" />
          Revisions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {!isLoading && revisions.length === 0 && (
          <p className="text-muted-foreground">No revisions yet.</p>
        )}
        {revisions.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">
              #{r.id} · {format(new Date(r.created_at), "MMM d, HH:mm")}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => doRestore(r.id)}
              disabled={restoring}
            >
              <RotateCcw className="size-3.5" />
              Restore
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function PostEditorPage() {
  const { slug } = useParams()
  const isEdit = Boolean(slug)
  const navigate = useNavigate()

  const { data: post, isLoading: loadingPost } = useGetPostQuery(slug ?? "", {
    skip: !isEdit,
  })
  const { data: categories = [] } = useListCategoriesQuery()
  const categoryOptions = useMemo<OptionCheckbox[]>(
    () =>
      categories.map((c) => ({
        value: String(c.id),
        label: c.name,
        children: c.children
          ? c.children.map((ch) => ({ value: String(ch.id), label: ch.name }))
          : undefined,
      })),
    [categories]
  )

  const { data: tags = [] } = useListTagsQuery()
  const tagOptions = useMemo<Option[]>(
    () => tags.map((t) => ({ value: t.name, label: t.name })),
    [tags]
  )

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

  // Media picker — returns a promise that resolves with the chosen URL (or null).
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerResolve = useRef<((url: string | null) => void) | null>(null)

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
        saved = await updatePost({ id: post.id, body: buildBody() }).unwrap()
      } else {
        saved = await createPost(buildBody()).unwrap()
      }
      if (publishAfter && saved.status !== "published") {
        saved = await changeStatus({
          id: saved.id,
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
      await changeStatus({ id: post.id, status }).unwrap()
      toast.success(`Moved to ${status}`)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  async function doDelete() {
    if (!post) return
    try {
      await deletePost(post.id).unwrap()
      toast.success("Post deleted")
      navigate("/posts")
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  if (isEdit && loadingPost) {
    return (
      <PageContainer title="Edit Post">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </PageContainer>
    )
  }
  if (isEdit && !post) {
    return (
      <PageContainer title="Edit Post">
        <p className="text-sm text-muted-foreground">Post not found.</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={isEdit ? "Edit Post" : "New Post"}
      description={isEdit && post ? `/${post.slug}` : "Draft a new post."}
      actions={
        <>
          <Button variant="ghost" onClick={() => navigate("/posts")}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => save(false)}
            disabled={saving}
          >
            <Save className="size-4" />
            Save draft
          </Button>
          {(!isEdit || post?.status !== "published") && (
            <Button onClick={() => save(true)} disabled={saving}>
              <Send className="size-4" />
              Publish
            </Button>
          )}
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-muted-foreground">
                Featured image
              </Label>
              {featured && (
                <img
                  src={featured}
                  alt="Featured"
                  className="aspect-video h-28 object-contain"
                />
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1 cursor-pointer",
                    !featured && "h-28 w-28 items-center justify-center"
                  )}
                  onClick={async () => {
                    const url = await pickImage()
                    if (url) setFeatured(url)
                  }}
                >
                  {featured ? (
                    "Change image"
                  ) : (
                    <Image className="size-8 text-muted-foreground" />
                  )}
                </Button>
                {featured && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFeatured("")}
                    className="cursor-pointer"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-muted-foreground"
              >
                Title
              </Label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                className="w-full border-b text-2xl ring-0 outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="content"
              className="text-sm font-medium text-muted-foreground"
            >
              Content
            </Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              onPickImage={pickImage}
            />
          </div>
          {/* <div className="space-y-1.5">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary (optional)"
              className="min-h-[80px]"
            />
          </div> */}
        </div>

        <div className="space-y-2">
          <Card className="border-none bg-transparent ring-0">
            <CardHeader>
              <CardTitle className="text-base">Publish</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              {isEdit && post ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={post.status} />
                  </div>
                  {post.reading_time_min != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Reading time
                      </span>
                      <span>{post.reading_time_min} min</span>
                    </div>
                  )}
                  {post.published_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Published</span>
                      <span>
                        {format(new Date(post.published_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {post.status !== "draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setStatus("draft")}
                        disabled={changing}
                        className="cursor-pointer"
                      >
                        Set draft
                      </Button>
                    )}
                    {post.status !== "archived" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setStatus("archived")}
                        disabled={changing}
                        className="cursor-pointer"
                      >
                        Archive
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer text-destructive"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Saved as a draft until you publish.
                </p>
              )}
            </CardContent>
          </Card>
          <div className="border-b" />
          <Card className="overflow-visible border-none bg-transparent ring-0">
            <CardHeader>
              <CardTitle className="text-base">Organize</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                {/* <Label>Categories</Label> */}
                <MultipleCheckbox
                  title="Categories"
                  description="Select categories"
                  ButtonProps={{
                    variant: "outline",
                    className: "w-full justify-start",
                  }}
                  options={categoryOptions}
                  value={categoryValues}
                  onChange={(v) =>
                    setCategoryValues(
                      v.map(({ value, label }) => ({ value, label }))
                    )
                  }
                />
                {/* <MultipleSelector
                  value={categoryValues}
                  onChange={setCategoryValues}
                  options={categoryOptions}
                  placeholder="Select categories…"
                  hideClearAllButton
                  hidePlaceholderWhenSelected
                  emptyIndicator={
                    <p className="text-center text-sm text-muted-foreground">
                      No categories found.
                    </p>
                  }
                /> */}
              </div>
              <div className="space-y-1.5">
                <Label>Tags</Label>
                <MultipleSelector
                  value={tagValues}
                  onChange={setTagValues}
                  options={tagOptions}
                  creatable
                  placeholder="Add tags…"
                  hideClearAllButton
                  hidePlaceholderWhenSelected
                  emptyIndicator={
                    <p className="text-center text-sm text-muted-foreground">
                      Type to create a tag.
                    </p>
                  }
                />
                <p className="text-xs text-muted-foreground">
                  New tags are created automatically.
                </p>
              </div>
            </CardContent>
          </Card>

          {isEdit && post && (
            <>
              <div className="border-b" />
              <RevisionsCard postId={post.id} onRestored={populate} />
            </>
          )}
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              This permanently deletes the post and its comments, tags and
              revisions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={doDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={handlePickerOpenChange}
        onSelect={handlePicked}
      />
    </PageContainer>
  )
}

export default PostEditorPage
