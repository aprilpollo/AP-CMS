import { useEffect, useMemo, useState } from "react"
import {
  useCreateCategoryMutation,
  // useDeleteCategoryMutation,
  useListCategoriesQuery,
  // useUpdateCategoryMutation,
} from "@/store/api/cmsApi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  // CardContent,
  // CardDescription,
  // CardHeader,
  // CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import PageContainer from "@/shared/PageContainer"
import { FolderTree, ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import { flattenCategories } from "@/lib/cms"
import { apiError } from "@/utils/apiError"
import type { Category } from "@/types/cms"

function CategoriesCard() {
  return <Card className="h-28 w-full"></Card>
}

function CategoryItem({
  category,
  expandedIds,
  toggleExpand,
  forceExpanded,
}: {
  category: Category
  expandedIds: Set<string>
  toggleExpand: (id: string) => void
  forceExpanded: boolean
}) {
  const isExpanded = forceExpanded || expandedIds.has(category.id)
  const hasChildren = category.children && category.children.length > 0

  return (
    <>
      <li className="flex min-h-9 items-center justify-between gap-2 py-1">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">{category.name}</span>
            <span className="text-xs text-muted-foreground">
              {category.slug}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {category.description}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {hasChildren && (
            <Badge variant="outline">+ {category.children!.length}</Badge>
          )}
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => toggleExpand(category.id)}
            >
              <ChevronDown
                className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </Button>
          )}
        </div>
      </li>
      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.ul
            className="ml-6 divide-y overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {category.children!.map((child) => (
              <CategoryItem
                key={child.id}
                category={child}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                forceExpanded={forceExpanded}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </>
  )
}

const emptyForm = {
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

  const { data: categories = [], isFetching } = useListCategoriesQuery(
    search ? { search } : undefined
  )
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const searching = !!search

  const parentOptions = useMemo(
    () => flattenCategories(categories),
    [categories]
  )

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openAdd() {
    setForm(emptyForm)
    setAddOpen(true)
  }

  async function submitAdd() {
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }
    try {
      await createCategory({
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        parent_id: form.parentId === "none" ? null : form.parentId,
        description: form.description.trim() || undefined,
      }).unwrap()
      toast.success("Category created")
      setAddOpen(false)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  return (
    <PageContainer
      title="Categories"
      description="Organize posts into a hierarchical category tree."
      actions={
        <Button size="sm" onClick={openAdd}>
          <FolderTree size={16} />
          Add Category
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CategoriesCard />
          <CategoriesCard />
          <CategoriesCard />
          <CategoriesCard />
        </div>
        <header>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search categories…"
            className="max-w-sm"
          />
        </header>
        <main>
          {categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {isFetching
                ? "Loading categories…"
                : searching
                  ? `No categories match “${search}”.`
                  : "No categories yet."}
            </p>
          ) : (
            <ul className="divide-y">
              {categories.map((c) => (
                <CategoryItem
                  key={c.id}
                  category={c}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                  forceExpanded={searching}
                />
              ))}
            </ul>
          )}
        </main>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Slug is generated from the name when left blank.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Technology"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug (optional)</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                placeholder="technology"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parent</Label>
              <Select
                value={form.parentId}
                onValueChange={(v) => setForm((f) => ({ ...f, parentId: v }))}
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none" className="cursor-pointer">No parent (top level)</SelectItem>
                    {parentOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id} className="cursor-pointer">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description (optional)</Label>
              <Textarea
                id="cat-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="min-h-18"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={submitAdd} disabled={creating}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default CategoriesPage
