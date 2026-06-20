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
  X,
  PanelLeftIcon,
  PanelRightIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
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
import { ScrollArea } from "@/components/ui/scroll-area"
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

// ─── Revisions panel ─────────────────────────────────────────────────────────

function RevisionsPanel({
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

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>
  if (revisions.length === 0)
    return <p className="text-sm text-muted-foreground">No revisions yet.</p>

  return (
    <div className="space-y-2">
      {revisions.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            #{r.id} · {format(new Date(r.created_at), "MMM d, HH:mm")}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => doRestore(r.id)}
            disabled={restoring}
          >
            <RotateCcw className="size-3" />
            Restore
          </Button>
        </div>
      ))}
    </div>
  )
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export default function PostEditorPage() {
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
        children: c.children?.map((ch) => ({
          value: String(ch.id),
          label: ch.name,
        })),
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

  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [leftTab, setLeftTab] = useState<"media" | "document">("media")
  const [rightTab, setRightTab] = useState<"post" | "revisions">("post")

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
        {/* ── Toolbar ── */}
        <div className="flex h-12 shrink-0 items-center justify-between gap-1 border-b bg-background px-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/posts")}
              className="rounded-sm"
            >
              <ArrowLeft className="text-muted-foreground" />
              Back
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setLeftOpen((v) => !v)}
              className="rounded-sm"
              aria-label="Toggle left panel"
            >
              <PanelLeftIcon className="text-muted-foreground" />
            </Button>
          </div>
          {/* <div className="flex-1 truncate">
            <span className="text-sm font-medium">
              {isEdit ? "Edit Post" : "New Post"}
            </span>
            {isEdit && post && (
              <span className="ml-2 text-xs text-muted-foreground">
                /{post.slug}
              </span>
            )}
          </div> */}
          <div className="flex items-center gap-1">
            {/* {isEdit && post && <StatusBadge status={post.status} />} */}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setRightOpen((v) => !v)}
              aria-label="Toggle right panel"
              className="rounded-sm"
            >
              <PanelRightIcon className="text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => save(false)}
              disabled={saving}
              className="rounded-sm"
            >
              <Save className="text-muted-foreground" />
              Save draft
            </Button>

            {(!isEdit || post?.status !== "published") && (
              <Button
                size="sm"
                onClick={() => save(true)}
                disabled={saving}
                className="rounded-sm"
              >
                <Send className="text-muted-foreground" />
                Publish
              </Button>
            )}
          </div>
        </div>

        {/* ── 3-panel area ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left panel ── */}
          <aside
            className={cn(
              "shrink-0 overflow-hidden border-r bg-background transition-[width] duration-200 ease-linear",
              leftOpen ? "w-72" : "w-0"
            )}
          >
            <div className="flex h-full min-w-72 flex-col">
              {/* tabs */}
              <div className="flex h-10 shrink-0 items-stretch border-b text-sm font-medium">
                {(["media", "document"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLeftTab(tab)}
                    className={cn(
                      "flex-1 capitalize transition-colors",
                      leftTab === tab
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-4 p-4">
                  {leftTab === "media" && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Featured Image
                      </p>
                      {featured ? (
                        <div className="group relative overflow-hidden rounded-md border">
                          <img
                            src={featured}
                            alt="Featured"
                            className="aspect-video w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={async () => {
                                const url = await pickImage()
                                if (url) setFeatured(url)
                              }}
                            >
                              Change
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setFeatured("")}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={async () => {
                            const url = await pickImage()
                            if (url) setFeatured(url)
                          }}
                          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          <Image className="size-8" />
                          <span>Set featured image</span>
                        </button>
                      )}
                    </div>
                  )}

                  {leftTab === "document" && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Excerpt
                        </p>
                        <Textarea
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          placeholder="Write a short summary…"
                          className="min-h-30 resize-none text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Used as a preview snippet in post lists and SEO.
                        </p>
                      </div>

                      {isEdit && post && (
                        <>
                          <Separator />
                          <div className="space-y-1.5 text-sm">
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                              Details
                            </p>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Created
                              </span>
                              <span>
                                {format(
                                  new Date(post.created_at),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                            {post.published_at && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Published
                                </span>
                                <span>
                                  {format(
                                    new Date(post.published_at),
                                    "MMM d, yyyy"
                                  )}
                                </span>
                              </div>
                            )}
                            {post.reading_time_min != null && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Reading time
                                </span>
                                <span>{post.reading_time_min} min</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </aside>

          {/* ── Center editor ── */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="mx-auto max-w-3xl space-y-4 px-8 py-10">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add title"
                  className="w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/40"
                />
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  onPickImage={pickImage}
                />
              </div>
            </ScrollArea>
          </div>

          {/* ── Right panel ── */}
          <aside
            className={cn(
              "shrink-0 overflow-hidden border-l bg-background transition-[width] duration-200 ease-linear",
              rightOpen ? "w-72" : "w-0"
            )}
          >
            <div className="flex h-full min-w-72 flex-col">
              {/* tabs */}
              <div className="flex h-10 shrink-0 items-stretch border-b text-sm font-medium">
                {(["post", "revisions"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRightTab(tab)}
                    className={cn(
                      "flex-1 capitalize transition-colors",
                      rightTab === tab
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab === "revisions" ? (
                      <span className="flex items-center justify-center gap-1">
                        <History className="size-3.5" />
                        Revisions
                      </span>
                    ) : (
                      "Post"
                    )}
                  </button>
                ))}
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-1 p-4">
                  {rightTab === "post" && (
                    <>
                      <div className="space-y-2 pb-3">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Status
                        </p>
                        {isEdit && post ? (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Current
                              </span>
                              <StatusBadge status={post.status} />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {post.status !== "draft" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setStatus("draft")}
                                  disabled={changing}
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
                                >
                                  Archive
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setConfirmDelete(true)}
                              >
                                <Trash2 className="size-3.5" />
                                Delete
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Saved as a draft until you publish.
                          </p>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-2 py-3">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Categories
                        </p>
                        <MultipleCheckbox
                          title="Categories"
                          description="Select categories"
                          ButtonProps={{
                            variant: "outline",
                            className: "w-full justify-start text-sm",
                          }}
                          options={categoryOptions}
                          value={categoryValues}
                          onChange={(v) =>
                            setCategoryValues(
                              v.map(({ value, label }) => ({ value, label }))
                            )
                          }
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2 pt-3">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Tags
                        </p>
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
                    </>
                  )}

                  {rightTab === "revisions" && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Revision History
                      </p>
                      {isEdit && post ? (
                        <RevisionsPanel
                          postId={String(post.id)}
                          onRestored={populate}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Save the post first to see revisions.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Dialogs ── */}
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
    </>
  )
}
