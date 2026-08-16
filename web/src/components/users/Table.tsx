import { useEffect, useState } from "react"
import PageContainer from "@/shared/PageContainer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableFooter,
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowDownToLine,
  AtSign,
  CalendarDays,
  CircleDotDashed,
  Plus,
  Search,
  SlidersHorizontal,
  UserShield,
} from "lucide-react"

function UsersListPage() {
  const items = [
    {
      id: "1",
      firstName: "Alex",
      lastName: "Thompson",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      email: "alex.t@company.com",
      role: "Admin",
      status: "Active",
      joinDate: "2023-01-15",
    },
  ]

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
          <TableBody className="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg">
            {items.map((item) => (
              <TableRow
                className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r"
                key={item.id}
              >
                <TableCell className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={item.avatar} alt={item.firstName} />
                    <AvatarFallback>
                      {item.firstName.charAt(0)}
                      {item.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-md leading-none font-medium">
                    {item.firstName} {item.lastName}
                  </p>
                </TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.joinDate}</TableCell>
              </TableRow>
            ))}
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
