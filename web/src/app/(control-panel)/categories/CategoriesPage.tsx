import { useEffect, useMemo, useState } from "react"
import {
  FolderTree,
  Folder,
  FolderOpen,
  Hash,
  Layers,
  ListTree,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Search,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useListCategoriesQuery,
  useUpdateCategoryMutation,
  type CreateCategoryBody,
} from "@/store/api/cmsApi"
import PageContainer from "@/shared/PageContainer"
import StatCard from "@/shared/StatCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
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
  DropdownMenuSeparator,
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { buildCategoryTree, flattenCategories } from "@/lib/cms"
import { apiError } from "@/utils/apiError"
import type { Category } from "@/types/cms"

/* ---------- tree helpers ---------- */

/** Walk the whole tree (used for stats). */
function walk(cats: Category[], depth = 0): { node: Category; depth: number }[] {
  return cats.flatMap((c) => [
    { node: c, depth },
    ...(c.children ? walk(c.children, depth + 1) : []),
  ])
}

function collectIds(cat: Category): Set<string> {
  const ids = new Set<string>([cat.id])
  cat.children?.forEach((child) =>
    collectIds(child).forEach((id) => ids.add(id))
  )
  return ids
}

/* ---------- tree node ---------- */

function TreeNode({
  category,
  expandedIds,
  toggleExpand,
  forceExpanded,
  onEdit,
  onDelete,
}: {
  category: Category
  expandedIds: Set<string>
  toggleExpand: (id: string) => void
  forceExpanded: boolean
  onEdit: (c: Category) => void
  onDelete: (c: Category) => void
}) {
  const hasChildren = !!category.children && category.children.length > 0
  const isExpanded = hasChildren && (forceExpanded || expandedIds.has(category.id))

  return (
    <li>
      <div className="group flex min-h-10 items-center gap-1.5 rounded-md px-1 transition-colors hover:bg-muted/60">
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon-xs"
            className="shrink-0 text-muted-foreground"
            onClick={() => toggleExpand(category.id)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronRight
              className={cn(
                "transition-transform duration-200",
                isExpanded && "rotate-90"
              )}
            />
          </Button>
        ) : (
          <span className="w-6 shrink-0" aria-hidden />
        )}

        <span className="shrink-0 text-muted-foreground">
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="size-4" />
            ) : (
              <Folder className="size-4" />
            )
          ) : (
            <Hash className="size-3.5" />
          )}
        </span>

        <span className="truncate text-sm font-medium">{category.name}</span>
        <span className="truncate font-mono text-xs text-muted-foreground">
          /{category.slug}
        </span>

        {category.description && (
          <span className="hidden truncate text-xs text-muted-foreground/80 md:inline">
            · {category.description}
          </span>
        )}

        <span className="ml-auto flex shrink-0 items-center gap-1">
          {hasChildren && (
            <Badge variant="secondary">{category.children!.length}</Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
              >
                <MoreHorizontal />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onEdit(category)}>
                  <Pencil data-icon="inline-start" />
                  Edit
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(category)}
                >
                  <Trash2 data-icon="inline-start" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.ul
            className="ml-3.5 overflow-hidden border-l border-border pl-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {category.children!.map((child) => (
              <TreeNode
                key={child.id}
                category={child}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                forceExpanded={forceExpanded}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}

/* ---------- form ---------- */

type FormState = {
  name: string
  slug: string
  parentId: string
  description: string
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  parentId: "none",
  description: "",
}

function CategoriesPage() {
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")

  // Debounce keystrokes before querying the API.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data: flat = [], isFetching } = useListCategoriesQuery(
    search ? { search } : undefined
  )
  // The API returns a flat list keyed by parent_id; assemble it into a tree.
  const categories = useMemo(() => buildCategoryTree(flat), [flat])
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation()
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation()
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation()

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const searching = !!search
  const saving = creating || updating

  const stats = useMemo(() => {
    const all = walk(categories)
    const topLevel = categories.length
    const maxDepth = all.reduce((m, x) => Math.max(m, x.depth), 0)
    return {
      total: all.length,
      topLevel,
      sub: all.length - topLevel,
      depth: all.length ? maxDepth + 1 : 0,
    }
  }, [categories])

  // For the parent picker: exclude the category being edited and its subtree.
  const parentOptions = useMemo(() => {
    const excluded = editing ? collectIds(editing) : new Set<string>()
    return flattenCategories(categories).filter((o) => !excluded.has(o.id))
  }, [categories, editing])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(c: Category) {
    setEditing(c)
    setForm({
      name: c.name,
      slug: c.slug,
      parentId: c.parent_id ?? "none",
      description: c.description ?? "",
    })
    setDialogOpen(true)
  }

  async function submit() {
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }
    const body: CreateCategoryBody = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      parent_id: form.parentId === "none" ? null : form.parentId,
      description: form.description.trim() || undefined,
    }
    try {
      if (editing) {
        await updateCategory({ id: editing.id, body }).unwrap()
        toast.success("Category updated")
      } else {
        await createCategory(body).unwrap()
        toast.success("Category created")
      }
      setDialogOpen(false)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteCategory(toDelete.id).unwrap()
      toast.success("Category deleted")
      setToDelete(null)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  const loading = isFetching && categories.length === 0

  return (
    <PageContainer
      title="Categories"
      description="Organize posts into a hierarchical category tree."
      className="p-4 md:p-6"
      actions={
        <Button size="sm" onClick={openAdd}>
          <Plus data-icon="inline-start" />
          Add Category
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={FolderTree} label="Total categories" value={stats.total} />
        <StatCard icon={Folder} label="Top level" value={stats.topLevel} />
        <StatCard icon={ListTree} label="Subcategories" value={stats.sub} />
        <StatCard icon={Layers} label="Nesting depth" value={stats.depth} />
      </div>

      <InputGroup className="max-w-sm">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search categories…"
        />
      </InputGroup>

      {loading ? (
        <div className="flex flex-col gap-2 rounded-lg border p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderTree />
            </EmptyMedia>
            <EmptyTitle>
              {searching ? "No matches" : "No categories yet"}
            </EmptyTitle>
            <EmptyDescription>
              {searching
                ? `No categories match “${search}”.`
                : "Create your first category to start organizing posts."}
            </EmptyDescription>
          </EmptyHeader>
          {!searching && (
            <Button size="sm" onClick={openAdd}>
              <Plus data-icon="inline-start" />
              Add Category
            </Button>
          )}
        </Empty>
      ) : (
        <ul className="rounded-lg border p-2">
          {categories.map((c) => (
            <TreeNode
              key={c.id}
              category={c}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              forceExpanded={searching}
              onEdit={openEdit}
              onDelete={setToDelete}
            />
          ))}
        </ul>
      )}

      {/* Add / Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              Slug is generated from the name when left blank.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cat-name">Name</FieldLabel>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Technology"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="cat-slug">Slug</FieldLabel>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                placeholder="technology"
              />
              <FieldDescription>Optional.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="cat-parent">Parent</FieldLabel>
              <Select
                value={form.parentId}
                onValueChange={(v) => setForm((f) => ({ ...f, parentId: v }))}
              >
                <SelectTrigger id="cat-parent" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">No parent (top level)</SelectItem>
                    {parentOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="cat-desc">Description</FieldLabel>
              <Textarea
                id="cat-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="min-h-18"
                placeholder="What belongs in this category?"
              />
              <FieldDescription>Optional.</FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={submit} disabled={saving}>
              {saving && <Spinner data-icon="inline-start" />}
              {editing
                ? saving
                  ? "Saving…"
                  : "Save changes"
                : saving
                  ? "Creating…"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              “{toDelete?.name}” will be deleted
              {toDelete?.children && toDelete.children.length > 0
                ? `, along with its ${toDelete.children.length} subcategor${
                    toDelete.children.length === 1 ? "y" : "ies"
                  }`
                : ""}
              . This cannot be undone.
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
              {deleting && <Spinner data-icon="inline-start" />}
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default CategoriesPage
