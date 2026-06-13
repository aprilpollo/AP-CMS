import { Badge } from "@/components/ui/badge"
import {cn} from "@/lib/utils"
import type { Category, PostStatus } from "@/types/cms"


const statusStyles: Record<PostStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published:
    "border-transparent bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  archived:
    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
}

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge variant="outline" className={cn(statusStyles[status], "capitalize rounded-sm")}>
      {status}
    </Badge>
  )
}

/** Flattens a category tree into indented options for a <Select>. */
export function flattenCategories(
  cats: Category[],
  depth = 0
): { id: string; label: string }[] {
  return cats.flatMap((c) => [
    {
      id: c.id,
      label: `${"  ".repeat(depth)}${depth > 0 ? "- " : ""}${c.name}`,
    },
    ...(c.children ? flattenCategories(c.children, depth + 1) : []),
  ])
}
