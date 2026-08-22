import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  CircleDotDashed,
  Clock,
  Copy,
  Ellipsis,
  Globe,
  KeyRound,
  Plug,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TrashIcon,
  TriangleAlert,
} from "lucide-react"
import PageContainer from "@/shared/PageContainer"
import KpiCard from "@/shared/KpiCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup } from "@/components/ui/field"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  addConnection,
  allScopes,
  connections as initialConnections,
  expiryFromDays,
  issueCredential,
  requestLog,
  type Connection,
  type ConnectionScope,
  type ConnectionStatus,
} from "./data"

const statusVariant: Record<
  ConnectionStatus,
  "default" | "secondary" | "destructive"
> = {
  Active: "default",
  Expired: "secondary",
  Revoked: "destructive",
}

const EXPIRY_OPTIONS = [
  { label: "90 days", value: "90" },
  { label: "180 days", value: "180" },
  { label: "1 year", value: "365" },
  { label: "Never", value: "never" },
]

const schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  domain: z
    .string()
    .min(3, "Enter the domain that will call the API")
    .regex(
      /^(?!https?:\/\/)[a-z0-9.-]+\.[a-z]{2,}$/i,
      "Enter a bare domain, e.g. blog.example.com"
    ),
  scopes: z.array(z.string()).min(1, "Pick at least one scope"),
  expiry: z.string(),
})

type FormValues = z.infer<typeof schema>

const number = new Intl.NumberFormat("en-US")

/** Page numbers around the current one, with an ellipsis for each gap. */
function pageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const wanted = [1, total, current, current - 1, current + 1]
  const pages = [...new Set(wanted)]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
  const out: (number | "ellipsis")[] = []
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) out.push("ellipsis")
    out.push(page)
  })
  return out
}

/** Days until a date, or null when it never expires. */
function daysUntil(date: string | null) {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}

function ConnectionsPage() {
  // Copy: addConnection() pushes into the shared mock array, so state must not
  // alias it or the new row lands in the list twice.
  const [items, setItems] = useState<Connection[]>(() => [...initialConnections])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createOpen, setCreateOpen] = useState(false)
  const [issued, setIssued] = useState<{
    name: string
    keyId: string
    secret: string
    rotated: boolean
  } | null>(null)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [toRevoke, setToRevoke] = useState<Connection | null>(null)
  const [toDelete, setToDelete] = useState<Connection | null>(null)

  // Derived so the panel reflects rotate/revoke while it stays open.
  const details = items.find((item) => item.id === detailsId) ?? null

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.domain.toLowerCase().includes(query)
    )
  }, [items, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  // Clamp instead of resetting in an effect, so filtering never renders a blank page.
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * pageSize
  const paged = filtered.slice(pageStart, pageStart + pageSize)

  const stats = useMemo(() => {
    const active = items.filter((item) => item.status === "Active")
    const expiringSoon = active.filter((item) => {
      const days = daysUntil(item.expiresAt)
      return days !== null && days <= 30
    })
    const requests = items.reduce((sum, item) => sum + item.requests30d, 0)
    return {
      active: active.length,
      expiringSoon: expiringSoon.length,
      requests,
    }
  }, [items])

  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { name: "", domain: "", scopes: ["posts:read"], expiry: "365" },
    resolver: zodResolver(schema),
  })

  const copy = (value: string, message: string) => {
    navigator.clipboard?.writeText(value)
    toast.success(message)
  }

  const onCreate = (values: FormValues) => {
    const credential = issueCredential()
    const connection = addConnection({
      name: values.name,
      domain: values.domain,
      scopes: values.scopes as ConnectionScope[],
      expiresAt: expiryFromDays(
        values.expiry === "never" ? null : Number(values.expiry)
      ),
      keyId: credential.keyId,
      secretLast4: credential.secretLast4,
    })
    setItems((prev) => [...prev, connection])
    setCreateOpen(false)
    form.reset()
    setIssued({
      name: connection.name,
      keyId: credential.keyId,
      secret: credential.secret,
      rotated: false,
    })
  }

  const rotate = (connection: Connection) => {
    const credential = issueCredential()
    setItems((prev) =>
      prev.map((item) =>
        item.id === connection.id
          ? {
              ...item,
              keyId: credential.keyId,
              secretLast4: credential.secretLast4,
              status: "Active",
            }
          : item
      )
    )
    setIssued({
      name: connection.name,
      keyId: credential.keyId,
      secret: credential.secret,
      rotated: true,
    })
  }

  const revoke = (connection: Connection) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === connection.id ? { ...item, status: "Revoked" } : item
      )
    )
    setToRevoke(null)
    toast.success(`${connection.name} can no longer call the API`)
  }

  const remove = (connection: Connection) => {
    setItems((prev) => prev.filter((item) => item.id !== connection.id))
    setToDelete(null)
    toast.success("Connection deleted")
  }

  return (
    <PageContainer
      title="Connections"
      className="p-4 md:p-6"
      description="Sites that are allowed to pull content from this CMS."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          icon={Plug}
          label="Active connections"
          value={String(stats.active)}
          hint={`${items.length} total`}
        />
        <KpiCard
          icon={TriangleAlert}
          label="Expiring within 30 days"
          value={String(stats.expiringSoon)}
          hint="rotate before they lapse"
        />
        <KpiCard
          icon={Globe}
          label="API requests"
          value={number.format(stats.requests)}
          hint="last 30 days"
        />
      </div>

      <header className="flex items-center justify-between py-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search site or domain …"
            className="h-7 rounded-sm pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus />
            New connection
          </Button>
        </div>
      </header>

      <div>
        <Table>
          <TableHeader className="bg-transparent">
            <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
              <TableHead>
                <div className="flex items-center gap-1">
                  <Globe className="size-4 text-muted-foreground" />
                  Site
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <KeyRound className="size-4 text-muted-foreground" />
                  Key ID
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  Scopes
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
                  <Clock className="size-4 text-muted-foreground" />
                  Last used
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <CalendarClock className="size-4 text-muted-foreground" />
                  Expires
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {paged.map((item) => {
                const days = daysUntil(item.expiresAt)
                return (
                  <TableRow
                    key={item.id}
                    className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          className="text-left font-medium hover:underline"
                          onClick={() => setDetailsId(item.id)}
                        >
                          {item.name}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          {item.domain}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {item.keyId}
                        </code>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          aria-label="Copy key ID"
                          onClick={() => copy(item.keyId, "Key ID copied")}
                        >
                          <Copy />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.scopes.map((scope) => (
                          <Badge
                            key={scope}
                            variant="outline"
                            className="rounded-sm"
                          >
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[item.status]}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {item.lastUsedAt ?? "-"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {item.expiresAt ? (
                        <span
                          className={
                            days !== null && days <= 30 && item.status === "Active"
                              ? "text-destructive"
                              : undefined
                          }
                        >
                          {item.expiresAt}
                          {days !== null &&
                            days > 0 &&
                            days <= 30 &&
                            ` (${days}d)`}
                        </span>
                      ) : (
                        "Never"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Open actions menu"
                          >
                            <Ellipsis />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              onSelect={() => setDetailsId(item.id)}
                            >
                              <KeyRound />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => copy(item.keyId, "Key ID copied")}
                            >
                              <Copy />
                              Copy key ID
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => rotate(item)}>
                              <RefreshCw />
                              Rotate key
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              disabled={item.status === "Revoked"}
                              onSelect={() => setToRevoke(item)}
                            >
                              <Ban />
                              Revoke access
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setToDelete(item)}
                            >
                              <TrashIcon />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell className="h-24 text-center" colSpan={7}>
                    No connections found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
        </Table>
        <footer className="flex flex-wrap items-center justify-between gap-2 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value))
                setPage(1)
              }}
            >
              <SelectTrigger className="w-25 cursor-pointer rounded-sm" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-25">
                <SelectGroup>
                  {[10, 20, 30].map((size) => (
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
              {filtered.length === 0
                ? "0 connections"
                : `${pageStart + 1}–${pageStart + paged.length} of ${filtered.length}`}
            </span>
          </div>

          <Pagination aria-label="Pagination" className="mx-0 w-auto">
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
        </footer>
      </div>

      {/* Issue a new credential */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New connection</DialogTitle>
            <DialogDescription>
              Issue a read-only credential for a site that pulls content from
              this CMS.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id="connection-form"
              className="space-y-4"
              onSubmit={form.handleSubmit(onCreate)}
            >
              <FieldGroup>
                <Field>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site name</FormLabel>
                        <FormControl>
                          <Input placeholder="Marketing site" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>
                <Field>
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain</FormLabel>
                        <FormControl>
                          <Input placeholder="blog.example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Requests from other origins are rejected.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>
                <Field>
                  <FormField
                    control={form.control}
                    name="scopes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scopes</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {allScopes.map((scope) => {
                            const checked = field.value.includes(scope.value)
                            return (
                              <label
                                key={scope.value}
                                className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm"
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(next) =>
                                    field.onChange(
                                      next === true
                                        ? [...field.value, scope.value]
                                        : field.value.filter(
                                            (value) => value !== scope.value
                                          )
                                    )
                                  }
                                />
                                <span>{scope.label}</span>
                                <code className="ml-auto text-xs text-muted-foreground">
                                  read
                                </code>
                              </label>
                            )
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>
                <Field>
                  <FormField
                    control={form.control}
                    name="expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expires in</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {EXPIRY_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>
              </FieldGroup>
            </form>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="connection-form">
              Issue credential
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* The secret is shown exactly once */}
      <Dialog
        open={issued !== null}
        onOpenChange={(open) => !open && setIssued(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {issued?.rotated ? "Key rotated" : "Connection created"}
            </DialogTitle>
            <DialogDescription>
              Copy the secret now — it is not stored and cannot be shown again.
              {issued?.rotated &&
                " The previous key stopped working immediately."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Key ID</p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1.5 text-sm">
                  {issued?.keyId}
                </code>
                <Button
                  size="icon-sm"
                  variant="outline"
                  aria-label="Copy key ID"
                  onClick={() => issued && copy(issued.keyId, "Key ID copied")}
                >
                  <Copy />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Secret</p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1.5 text-sm">
                  {issued?.secret}
                </code>
                <Button
                  size="icon-sm"
                  variant="outline"
                  aria-label="Copy secret"
                  onClick={() => issued && copy(issued.secret, "Secret copied")}
                >
                  <Copy />
                </Button>
              </div>
            </div>
            <p className="flex items-start gap-2 rounded-md bg-muted p-2 text-xs text-muted-foreground">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
              Send it to {issued?.name} over a secure channel. If it leaks,
              rotate the key from this page.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIssued(null)}>
              <CheckCircle2 />
              I saved it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke */}
      <Dialog
        open={toRevoke !== null}
        onOpenChange={(open) => !open && setToRevoke(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke access</DialogTitle>
            <DialogDescription>
              {toRevoke?.name} ({toRevoke?.domain}) will stop receiving content
              immediately. You can issue a new credential later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToRevoke(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => toRevoke && revoke(toRevoke)}
            >
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete connection</DialogTitle>
            <DialogDescription>
              This removes {toDelete?.name} and its credential for good. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => toDelete && remove(toDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details */}
      <Sheet
        open={details !== null}
        onOpenChange={(open) => !open && setDetailsId(null)}
      >
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{details?.name}</SheetTitle>
            <SheetDescription>{details?.domain}</SheetDescription>
          </SheetHeader>
          {details && (
            <div className="space-y-4 overflow-y-auto px-4 pb-6 text-sm">
              <div className="space-y-2">
                <DetailRow
                  label="Status"
                  value={
                    <Badge variant={statusVariant[details.status]}>
                      {details.status}
                    </Badge>
                  }
                />
                <DetailRow
                  label="Key ID"
                  value={
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {details.keyId}
                    </code>
                  }
                />
                <DetailRow
                  label="Secret"
                  value={
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      ••••••••{details.secretLast4}
                    </code>
                  }
                />
                <DetailRow label="Created" value={details.createdAt} />
                <DetailRow
                  label="Expires"
                  value={details.expiresAt ?? "Never"}
                />
                <DetailRow
                  label="Last used"
                  value={details.lastUsedAt ?? "Never"}
                />
                <DetailRow
                  label="Requests (30d)"
                  value={number.format(details.requests30d)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-medium">Scopes</p>
                <div className="flex flex-wrap gap-1">
                  {details.scopes.map((scope) => (
                    <Badge key={scope} variant="outline" className="rounded-sm">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-medium">Recent requests</p>
                <ul className="space-y-2">
                  {requestLog.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <code className="min-w-0 truncate text-xs">
                        {entry.path}
                      </code>
                      <span
                        className={`shrink-0 text-xs tabular-nums ${
                          entry.status >= 400
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {entry.status} · {entry.timestamp.slice(11)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rotate(details)}
                >
                  <RefreshCw />
                  Rotate key
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={details.status === "Revoked"}
                  onClick={() => setToRevoke(details)}
                >
                  <Ban />
                  Revoke access
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageContainer>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate tabular-nums">{value}</span>
    </div>
  )
}

export default ConnectionsPage
