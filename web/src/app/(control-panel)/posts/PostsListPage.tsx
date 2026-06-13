import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { format } from "date-fns"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarClock,
  StickyNote,
  User,
  GlobeCheck,
  Eye,
  FolderTree,
  Tags,
  MessageSquare,
} from "lucide-react"
import { toast } from "sonner"
import PageContainer from "@/shared/PageContainer"
import Link from "@/shared/Link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MultipleCheckbox, type Option } from "@/components/combobox-multiple"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiError } from "@/utils/apiError"
import {
  useDeletePostMutation,
  useListCategoriesQuery,
  useListPostsQuery,
  //useListTagsQuery,
  type PostListParams,
} from "@/store/api/cmsApi"
import type { Post } from "@/types/cms"
// import { flattenCategories } from "@/lib/cms"
import { cn } from "@/lib/utils"

const LIMIT = 10

function PostsListPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [categoryValues, setCategoryValues] = useState<Option[]>([])
  // const [tagValues, setTagValues] = useState<Option[]>([])
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState<Post | null>(null)

  const { data: categories = [] } = useListCategoriesQuery()
  // const { data: tags = [] } = useListTagsQuery()

  const categoryOptions = useMemo<Option[]>(
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

  // const tagOptions = useMemo<Option[]>(
  //   () => tags.map((t) => ({ value: t.slug, label: t.name })),
  //   [tags]
  // )

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const params: PostListParams = useMemo(() => {
    const p: PostListParams = {
      _limit: LIMIT,
      _offset: (page - 1) * LIMIT,
      _sort: "created_at",
      _order: "DESC",
    }
    if (status !== "all") p.status = status
    if (categoryValues.length)
      p.category_id = categoryValues.map((o) => o.value).join(",")
    // if (tagValues.length) p.tag = tagValues.map((o) => o.value).join(",")
    if (search.trim()) p.search = search.trim()
    return p
  }, [status, search, page, categoryValues])

  const { data, isFetching, isError, error } = useListPostsQuery(params)
  const [deletePost, { isLoading: deleting }] = useDeletePostMutation()

  const items = data?.items ?? []
  const total = data?.pagination?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / LIMIT))

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deletePost(toDelete.id).unwrap()
      toast.success("Post deleted")
      setToDelete(null)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  return (
    <PageContainer
      title="Posts"
      description="Create and manage your posts."
      actions={
        <Button
          onClick={() => navigate("/posts/new")}
          className="cursor-pointer"
        >
          <Plus className="size-4" />
          New Post
        </Button>
      }
    >
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts…"
            className="pl-8"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <MultipleCheckbox
          title="Categories"
          description="Select categories"
          options={categoryOptions}
          value={categoryValues}
          ButtonProps={{ variant: "outline", className: "w-48" }}
          onChange={(v) => {
            setCategoryValues(v)
            setPage(1)
          }}
        />
      </div>

      <div className="">
        <Table>
          <TableHeader className="bg-transparent">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[35%]">
                <span className="flex items-center gap-1">
                  <StickyNote className="size-4" />
                  Title
                </span>
              </TableHead>
              <TableHead className="w-[15%]">
                <span className="flex items-center gap-1">
                  <User className="size-4" />
                  Author
                </span>
              </TableHead>
              <TableHead className="w-[8%]">
                <span className="flex items-center gap-1">
                  <GlobeCheck className="size-4" />
                  Status
                </span>
              </TableHead>
              <TableHead className="w-[10%]">
                <span className="flex items-center gap-1">
                  <CalendarClock className="size-4" />
                  Published
                </span>
              </TableHead>
              <TableHead className="w-[10%]">
                <span className="flex items-center gap-1">
                  <FolderTree className="size-4" />
                  Category
                </span>
              </TableHead>
              <TableHead className="w-[10%]">
                <span className="flex items-center gap-1">
                  <Tags className="size-4" />
                  Tags
                </span>
              </TableHead>

              <TableHead className="w-[6%]">
                <span className="flex items-center gap-1">
                  <Eye className="size-4" />
                  Views
                </span>
              </TableHead>
              <TableHead className="w-[6%]">
                <span className="flex items-center gap-1">
                  <MessageSquare className="size-4" />
                  Comments
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <tbody aria-hidden="true" className="table-row h-2" />
          <TableBody className="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg">
            {isError && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-sm text-destructive"
                >
                  {apiError(error)}
                </TableCell>
              </TableRow>
            )}
            {!isError && items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  {isFetching ? "Loading…" : "No posts found."}
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow
                className="border-none odd:bg-muted/50 hover:bg-transparent odd:hover:bg-muted/50"
                key={item.id}
              >
                <TableCell className="py-2.5">
                  <div className="flex items-center">
                    <Avatar className="mr-2 aspect-video h-12 w-16">
                      <AvatarImage
                        src={item.featured_image_url ?? "#"}
                        alt={item.title}
                        className="rounded-sm object-contain"
                      />
                      <AvatarFallback className="rounded-sm">
                        {item.title.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      to={`./${item.slug}/edit`}
                      className="font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center">
                    <Avatar className="mr-2 h-10 w-10">
                      <AvatarImage
                        src={item.author?.avatar_url ?? "#"}
                        alt={item.author?.display_name ?? "Author"}
                      />
                      <AvatarFallback>
                        {item.author?.display_name?.slice(0, 2).toUpperCase() ??
                          "Author"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{item.author?.display_name}</p>
                      <span className="text-xs text-muted-foreground">
                        {item.author?.email}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-2.5">
                  <Badge
                    className={cn(
                      "capitalize",
                      item.status === "published" &&
                        "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
                      item.status === "draft" &&
                        "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                      item.status === "archived" &&
                        "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300"
                    )}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge className="rounded-sm" variant="secondary">
                    {item.published_at ? (
                      <span>
                        {format(new Date(item.published_at), "PPP")}
                        at {format(new Date(item.published_at), "p")}
                      </span>
                    ) : (
                      "Unpublished"
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="py-2.5">
                  {item.categories && item.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.categories.map((c) => (
                        <Badge
                          key={c.id}
                          className="rounded-sm"
                          variant="secondary"
                        >
                          {c.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    "Uncategorized"
                  )}
                </TableCell>
                <TableCell className="py-2.5">
                  {item.tags && item.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          className="rounded-sm"
                          variant="secondary"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    "No tags"
                  )}
                </TableCell>
                <TableCell className="py-2.5">0</TableCell>
                <TableCell className="py-2.5">0</TableCell>
                <TableCell className="py-2.5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 cursor-pointer p-0"
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`./${item.slug}/edit`)}
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setToDelete(item)}
                        disabled={deleting}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {isFetching ? "Loading…" : `${total} post${total === 1 ? "" : "s"}`}
        </span>
        <div className="flex items-center gap-2">
          <span>
            Page {page} of {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              “{toDelete?.title}” will be permanently deleted along with its
              comments, tags and revisions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default PostsListPage
