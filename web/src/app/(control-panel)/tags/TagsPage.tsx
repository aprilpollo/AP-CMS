import { useMemo, useState } from "react"
import {
  Search,
  Hash,
  Tags as TagsIcon,
  TrendingUp,
  EyeOff,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { toast } from "sonner"
import PageContainer from "@/shared/PageContainer"
import StatCard from "@/shared/StatCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { apiError } from "@/utils/apiError"
import { useDeleteTagMutation, useListTagsQuery } from "@/store/api/cmsApi"
import type { Tag } from "@/types/cms"

type SortKey = "popular" | "name"

function TagsPage() {
  const { data: tags = [], isFetching } = useListTagsQuery()
  const [deleteTag, { isLoading: deleting }] = useDeleteTagMutation()

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("popular")
  const [toDelete, setToDelete] = useState<Tag | null>(null)

  const stats = useMemo(() => {
    const used = tags.filter((t) => (t.post_count ?? 0) > 0).length
    const assignments = tags.reduce((sum, t) => sum + (t.post_count ?? 0), 0)
    return { total: tags.length, used, unused: tags.length - used, assignments }
  }, [tags])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = q
      ? tags.filter(
          (t) =>
            t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
        )
      : tags
    const sorted = [...list]
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name))
    else sorted.sort((a, b) => (b.post_count ?? 0) - (a.post_count ?? 0))
    return sorted
  }, [tags, search, sort])

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteTag(toDelete.id).unwrap()
      toast.success("Tag deleted")
      setToDelete(null)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  const loading = isFetching && tags.length === 0

  return (
    <PageContainer
      title="Tags"
      description="Tags are created automatically when you add them to a post."
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={TagsIcon} label="Total tags" value={stats.total} />
        <StatCard icon={TrendingUp} label="In use" value={stats.used} />
        <StatCard icon={EyeOff} label="Unused" value={stats.unused} />
        <StatCard
          icon={Hash}
          label="Post assignments"
          value={stats.assignments}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags…"
          />
        </InputGroup>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="popular">Most used</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 rounded-lg border p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TagsIcon />
            </EmptyMedia>
            <EmptyTitle>No tags yet</EmptyTitle>
            <EmptyDescription>
              Tags appear here once you add them to a post.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Posts</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No tags match “{search}”.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => {
                  const count = t.post_count ?? 0
                  return (
                    <TableRow key={t.id} className="group">
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-1.5">
                          <Hash className="size-3.5 text-muted-foreground" />
                          {t.name}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {t.slug}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={count > 0 ? "secondary" : "outline"}>
                          {count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="size-8 cursor-pointer p-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                            >
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setToDelete(t)}
                              >
                                <Trash2 data-icon="inline-start" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete tag?</DialogTitle>
            <DialogDescription>
              “{toDelete?.name}” will be removed from {toDelete?.post_count ?? 0}{" "}
              post
              {(toDelete?.post_count ?? 0) === 1 ? "" : "s"}. This cannot be
              undone.
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
              className="cursor-pointer"
            >
              {deleting && <Spinner data-icon="inline-start" />}
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default TagsPage
