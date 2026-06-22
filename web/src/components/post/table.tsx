import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/lib/cms"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DropdownMenuDestructive } from "@/components/post/menu"
import { format } from "date-fns"
import type { Author, Category, Post, PostStatus, Tag } from "@/types/cms"

const columns: ColumnDef<Post>[] = [
  {
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    id: "select",
    size: 20,
  },
  {
    accessorKey: "title",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
    header: "Title",
    size: 320,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<PostStatus>("status")
      return <StatusBadge status={status} />
    },
    size: 80,
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue<string>("created_at")
      return date ? (
        <span className="text-xs font-medium">
          {format(new Date(date), "PPp")}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
    size: 120,
  },

  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => {
      const author = row.getValue<Author | null | undefined>("author")
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={author?.avatar_url ?? undefined} />
            <AvatarFallback>{author?.display_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{author?.display_name}</span>
        </div>
      )
    },
    size: 100,
  },
  {
    accessorKey: "categories",
    cell: ({ row }) => {
      const categories = row.getValue<Category[] | undefined>("categories")
      return (
        <div className="flex gap-1 overflow-y-auto">
          {categories?.map((cat) => (
            <Badge
              key={cat.id}
              variant="outline"
              className="rounded-sm capitalize"
            >
              {cat.name}
            </Badge>
          ))}
        </div>
      )
    },
    header: "Categories",
    size: 100,
  },
  {
    accessorKey: "tags",
    cell: ({ row }) => {
      const tags = row.getValue<Tag[] | undefined>("tags")
      return (
        <div className="flex gap-1 overflow-y-auto">
          {tags?.map((tag) => (
            <Badge key={tag.id} variant="outline" className="rounded-sm">
              {tag.name}
            </Badge>
          ))}
        </div>
      )
    },
    header: "Tags",
    size: 100,
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row, table }) => (
      <DropdownMenuDestructive
        id={row.original.id}
        slug={row.original.slug}
        onDeleted={
          (table.options.meta as { onDeleted?: () => void })?.onDeleted
        }
      />
    ),
    size: 30,
  },
]

export function PostsTable({
  data,
  onDeleted,
}: {
  data: Post[]
  onDeleted?: () => void
}) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    meta: { onDeleted },
  })

  return (
    <div>
      <Table className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="hover:bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                data-state={row.getIsSelected() && "selected"}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* <p className="mt-4 text-center text-sm text-muted-foreground">
        Basic data table made with{" "}
        <a
          className="underline hover:text-foreground"
          href="https://tanstack.com/table"
          rel="noopener noreferrer"
          target="_blank"
        >
          TanStack Table
        </a>
      </p> */}
    </div>
  )
}
