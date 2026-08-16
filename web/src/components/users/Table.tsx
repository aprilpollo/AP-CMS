import { useState } from "react"
import { useNavigate } from "react-router"
import PageContainer from "@/shared/PageContainer"
import Link from "@/shared/Link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  CalendarDays,
  CircleDotDashed,
  Copy,
  Ellipsis,
  Eye,
  PencilIcon,
  Plus,
  Search,
  ShieldUser,
  SlidersHorizontal,
  TrashIcon,
  UserShield,
} from "lucide-react"
import { users as initialItems, type UserItem } from "./data"

function UserRowActions({
  user,
  onDelete,
}: {
  user: UserItem
  onDelete: (id: string) => void
}) {
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
          <DropdownMenuItem>
            <ShieldUser />
            Change role
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onDelete(user.id)}
          >
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UsersListPage() {
  const [items, setItems] = useState<UserItem[]>(initialItems)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const allSelected = items.length > 0 && selectedIds.length === items.length
  const someSelected = selectedIds.length > 0 && !allSelected

  const toggleAll = (checked: boolean) =>
    setSelectedIds(checked ? items.map((item) => item.id) : [])

  const toggleOne = (id: string, checked: boolean) =>
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((selected) => selected !== id)
    )

  const deleteUsers = (ids: string[]) => {
    setItems((prev) => prev.filter((item) => !ids.includes(item.id)))
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)))
  }

  return (
    <PageContainer
      title="Users Management"
      description="Manage user accounts and permissions."
    >
      <header className="flex items-center justify-between py-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            // value={searchInput}
            // onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search …"
            className="h-7 rounded-sm pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} selected
              </span>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-sm"
                onClick={() => deleteUsers(selectedIds)}
              >
                <TrashIcon />
                Delete
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" className="rounded-sm">
            <SlidersHorizontal />
            Add Filter
          </Button>
          <Button size="sm" variant="outline" className="rounded-sm">
            <ArrowDownToLine />
            Export
          </Button>
          <Button size="sm" variant="outline" className="rounded-sm">
            <Plus />
            Add User
          </Button>
        </div>
      </header>
      <div>
        <Table>
          <TableHeader className="bg-transparent">
            <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all"
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                  className="cursor-pointer"
                />
              </TableHead>
              <TableHead>Full Name</TableHead>

              <TableHead>
                <div className="flex items-center gap-1">
                  <AtSign className="size-4 text-muted-foreground" />
                  Email
                </div>
              </TableHead>

              <TableHead>
                <div className="flex items-center gap-1">
                  <UserShield className="size-4 text-muted-foreground" />
                  Role
                </div>
              </TableHead>

              <TableHead>
                <div className="flex items-center gap-1">
                  <CircleDotDashed className="size-4 text-muted-foreground" />
                  Status
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  Join Date
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {items.map((item) => (
              <TableRow
                className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r"
                key={item.id}
                data-state={selectedIds.includes(item.id) ? "selected" : undefined}
              >
                <TableCell className="w-10">
                  <Checkbox
                    className="cursor-pointer"
                    aria-label={`Select ${item.firstName} ${item.lastName}`}
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={(checked) =>
                      toggleOne(item.id, checked === true)
                    }
                  />
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={item.avatar} alt={item.firstName} />
                    <AvatarFallback>
                      {item.firstName.charAt(0)}
                      {item.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Link
                    to={`/users/${item.id}`}
                    className="text-md leading-none font-medium hover:underline"
                  >
                    {item.firstName} {item.lastName}
                  </Link>
                </TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.joinDate}</TableCell>
                <TableCell className="text-right">
                  <UserRowActions
                    user={item}
                    onDelete={(id) => deleteUsers([id])}
                  />
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell className="h-24 text-center" colSpan={7}>
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <footer className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select >
              <SelectTrigger className="w-25 rounded-sm cursor-pointer" size="sm">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent className="w-25">
                <SelectGroup>
                  <SelectItem value="10" className="cursor-pointer">10</SelectItem>
                  <SelectItem value="20" className="cursor-pointer">20</SelectItem>
                  <SelectItem value="30" className="cursor-pointer">30</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
            <div>
          <Pagination aria-label="Pagination">
            <PaginationContent >
              <PaginationItem >
                <PaginationPrevious href="#" className="h-7 rounded-sm" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" className="h-7">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" className="h-7" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" className="h-7">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis className="h-7 rounded-sm"/>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" className="h-7 rounded-sm" />
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
