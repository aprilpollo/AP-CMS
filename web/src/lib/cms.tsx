import { Badge } from "@/components/ui/badge"
import {cn} from "@/lib/utils"
import type { Category, PostStatus } from "@/types/cms"


const statusStyles: Record<PostStatus, string> = {
  draft: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  published:
    "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  archived:
    "bg-muted text-muted-foreground",
}

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge  className={cn(statusStyles[status], "capitalize rounded-sm")}>
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
