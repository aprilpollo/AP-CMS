import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { Image } from "lucide-react"
import Link from "@/shared/Link"

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
    size: 10,
  },
  {
    accessorKey: "title",
    cell: ({ row }) => (
      <div className="flex min-w-0">
        <div className="relative aspect-video w-16 shrink-0 overflow-hidden rounded-xs">
          {row.original.featured_image_url ? (
            <img
              className="h-full w-full object-cover"
              src={row.original.featured_image_url ?? undefined}
              alt="featured_image"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Image className="size-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="ml-2 flex min-w-0 flex-col">
          <Link
            to={`/posts/${row.original.slug}/edit`}
            className="truncate font-medium"
          >
            {row.getValue("title")}
          </Link>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.excerpt ? row.original.excerpt : "-"}
          </span>
        </div>
      </div>
    ),
    header: "Name",
    size: 320,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<PostStatus>("status")
      return (
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium capitalize">{status}</span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.published_at
              ? format(new Date(row.original.published_at), "PPp")
              : "-"}
          </span>
        </div>
      )
    },
    size: 80,
  },

  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => {
      const author = row.getValue<Author | null | undefined>("author")
      return (
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="size-8 shrink-0">
            <AvatarImage src={author?.avatar_url ?? undefined} />
            <AvatarFallback>{author?.display_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">
              {author?.display_name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {author?.email}
            </span>
          </div>
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
