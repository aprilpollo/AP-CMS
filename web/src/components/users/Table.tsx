import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import PageContainer from "@/shared/PageContainer"
import Link from "@/shared/Link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/components/ui/multiselect"
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowDownToLine,
  AtSign,
  BadgeCheck,
  Ban,
  CalendarDays,
  CircleDotDashed,
  Copy,
  ClockFading,
  Ellipsis,
  Eye,
  PencilIcon,
  Plus,
  RefreshCw,
  Search,
  ShieldUser,
  SlidersHorizontal,
  UserShield,
} from "lucide-react"
import { format } from "date-fns"
import { useListUsersQuery } from "@/store/api/cmsApi"
import { apiError } from "@/utils/apiError"
import type { UserAccount } from "@/types/cms"

const PAGE_SIZES = [10, 20, 30]

function fullName(user: UserAccount) {
  const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
  return name || user.display_name || user.email
}

function initials(user: UserAccount) {
  const first = user.first_name?.charAt(0) ?? ""
  const last = user.last_name?.charAt(0) ?? ""
  return (first + last || user.display_name?.charAt(0) || "?").toUpperCase()
}

function formatDate(value?: string | null) {
  if (!value) return "--/--"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "--/--" : format(date, "MMM dd yyyy, p")
}

/** Page numbers around the current one, with an ellipsis for each gap. */
function pageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [...new Set([1, total, current, current - 1, current + 1])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
  const out: (number | "ellipsis")[] = []
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) out.push("ellipsis")
    out.push(page)
  })
  return out
}

function UserRowActions({ user }: { user: UserAccount }) {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label="Open actions menu">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => navigate(`/users/${user.id}`)}>
            <Eye />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate(`/users/${user.id}`)}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => navigator.clipboard?.writeText(user.email)}
          >
            <Copy />
            Copy email
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate(`/users/${user.id}`)}>
            <ShieldUser />
            Change role
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UsersListPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState("")
  const search = useDebounce(searchInput, 350)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { data, isFetching, isError, error, refetch } = useListUsersQuery({
    search: search.trim() || undefined,
    _page: page,
    _limit: pageSize,
    _sort: "created_at",
    _order: "DESC",
  })

  const items = data?.items ?? []
  const total = data?.pagination?.total ?? items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, pageCount)
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = (currentPage - 1) * pageSize + items.length
  const loading = isFetching && items.length === 0

  // A new result set never keeps stale selections from the previous page.
  useEffect(() => {
    setSelectedIds([])
  }, [page, pageSize, search])

  // The debounced term arrives after the keystroke, so reset paging with it.
  useEffect(() => {
    setPage(1)
  }, [search])

  const allSelected = items.length > 0 && selectedIds.length === items.length
  const someSelected = selectedIds.length > 0 && !allSelected

  const toggleAll = (checked: boolean) =>
    setSelectedIds(checked ? items.map((item) => item.id) : [])

  const toggleOne = (id: number, checked: boolean) =>
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((selected) => selected !== id)
    )

  return (
    <PageContainer
      title="Users Management"
      description="Manage user accounts and permissions."
    >
      <header className="flex items-center justify-between py-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name or email …"
            className="h-7 rounded-sm pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>
          )}
          <Button size="sm" variant="ghost" className="rounded-sm">
            <SlidersHorizontal />
            Add Filter
          </Button>
          <Button size="sm" variant="outline" className="rounded-sm">
            <ArrowDownToLine />
            Export
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-sm"
            onClick={() => navigate("/users/new")}
          >
            <Plus />
            Add User
          </Button>
        </div>
      </header>
      <div>
        <Table>
          <TableHeader className="bg-transparent">
            <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
              <TableHead className="w-10 px-0">
                <div className="flex items-center justify-center">
                  <Checkbox
                    aria-label="Select all"
                    disabled={items.length === 0}
                    checked={
                      allSelected
                        ? true
                        : someSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    className="cursor-pointer"
                  />
                </div>
              </TableHead>
              <TableHead>Full Name</TableHead>

              <TableHead>
                <div className="flex items-center gap-1">
                  <AtSign className="size-3 text-muted-foreground" />
                  Email
                </div>
              </TableHead>

              <TableHead>
                <div className="flex items-center gap-1">
                  <UserShield className="size-3 text-muted-foreground" />
                  Role
                </div>
              </TableHead>

              <TableHead>
                <div className="flex items-center gap-1">
                  <CircleDotDashed className="size-3 text-muted-foreground" />
                  Status
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <CalendarDays className="size-3 text-muted-foreground" />
                  Join Date
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <ClockFading className="size-3 text-muted-foreground" />
                  Last Login
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {loading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow
                  key={`skeleton-${index}`}
                  className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r"
                >
                  {Array.from({ length: 8 }).map((__, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading &&
              items.map((item) => (
                <TableRow
                  className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r"
                  key={item.id}
                  data-state={
                    selectedIds.includes(item.id) ? "selected" : undefined
                  }
                >
                  <TableCell className="w-10 px-0">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        className="cursor-pointer"
                        aria-label={`Select ${fullName(item)}`}
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) =>
                          toggleOne(item.id, checked === true)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Avatar className="size-6">
                        <AvatarImage
                          src={item.avatar_url ?? undefined}
                          alt={fullName(item)}
                        />
                        <AvatarFallback>{initials(item)}</AvatarFallback>
                      </Avatar>
                      <Link
                        to={`/users/${item.id}`}
                        className="text-xs leading-none font-medium hover:underline"
                      >
                        {fullName(item)}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {item.email}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {item.role?.name ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className=" rounded-sm " variant="secondary">
                      {item.is_active ? (
                        <BadgeCheck className="text-blue-700 dark:text-blue-300" />
                      ) : (
                        <Ban className="text-red-700 dark:text-red-300" />
                      )}
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {formatDate(item.last_login_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserRowActions user={item} />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && isError && (
              <TableRow className="hover:bg-transparent">
                <TableCell className="h-24 text-center" colSpan={8}>
                  <p className="text-sm text-destructive">
                    {apiError(error, "Could not load users")}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 rounded-sm"
                    onClick={() => refetch()}
                  >
                    <RefreshCw />
                    Try again
                  </Button>
                </TableCell>
              </TableRow>
            )}

            {!loading && !isError && items.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell className="h-24 text-center" colSpan={8}>
                  {search.trim()
                    ? `No users match “${search.trim()}”.`
                    : "No users found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <footer className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value))
                setPage(1)
              }}
            >
              <SelectTrigger
                className="w-25 cursor-pointer rounded-sm"
                size="sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-25">
                <SelectGroup>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      className="cursor-pointer"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {total === 0 ? "0 users" : `${rangeStart}–${rangeEnd} of ${total}`}
            </span>
          </div>
          <div>
            <Pagination aria-label="Pagination">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className="h-7 rounded-sm"
                    aria-disabled={currentPage === 1}
                    tabIndex={currentPage === 1 ? -1 : undefined}
                    onClick={(event) => {
                      event.preventDefault()
                      setPage((prev) => Math.max(1, prev - 1))
                    }}
                  />
                </PaginationItem>
                {pageItems(currentPage, pageCount).map((item, index) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis className="h-7 rounded-sm" />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        className="h-7"
                        isActive={item === currentPage}
                        onClick={(event) => {
                          event.preventDefault()
                          setPage(item)
                        }}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className="h-7 rounded-sm"
                    aria-disabled={currentPage === pageCount}
                    tabIndex={currentPage === pageCount ? -1 : undefined}
                    onClick={(event) => {
                      event.preventDefault()
                      setPage((prev) => Math.min(pageCount, prev + 1))
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </footer>
      </div>
    </PageContainer>
  )
}

export default UsersListPage
