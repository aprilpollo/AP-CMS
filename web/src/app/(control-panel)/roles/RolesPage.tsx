import { Fragment, useMemo, useState, type ComponentType } from "react"
import {
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  FolderTree,
  Images,
  KeyRound,
  Lock,
  MessageSquare,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useListPermissionsQuery,
  useListRolesDetailedQuery,
  useSetRolePermissionsMutation,
  useUpdateRoleMutation,
} from "@/store/api/cmsApi"
import PageContainer from "@/shared/PageContainer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { apiError } from "@/utils/apiError"
import type { Permission, Role } from "@/types/cms"

type IconType = ComponentType<{ className?: string }>

/**
 * Mirrors domain.ProtectedRoleSlugs on the API: these roles are referenced by
 * slug in code, so they cannot be re-slugged, emptied, or deleted.
 */
const PROTECTED_SLUGS = new Set(["admin"])

const ROLE_COLORS = [
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#64748b",
]

const DEFAULT_COLOR = ROLE_COLORS[4]

const GROUP_META: Record<string, { label: string; icon: IconType }> = {
  posts: { label: "Posts", icon: FileText },
  categories: { label: "Categories", icon: FolderTree },
  comments: { label: "Comments", icon: MessageSquare },
  media: { label: "Media", icon: Images },
  users: { label: "Users", icon: Users },
  roles: { label: "Roles", icon: ShieldCheck },
  settings: { label: "Settings", icon: Settings },
}

const GROUP_ORDER = Object.keys(GROUP_META)

type PermissionGroup = {
  key: string
  label: string
  icon: IconType
  permissions: Permission[]
}

/** Buckets permissions by the prefix of their slug ("posts.publish" → posts). */
function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const buckets = new Map<string, Permission[]>()
  for (const permission of permissions) {
    const key = permission.slug.split(".")[0] || "other"
    buckets.set(key, [...(buckets.get(key) ?? []), permission])
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => {
      const ai = GROUP_ORDER.indexOf(a)
      const bi = GROUP_ORDER.indexOf(b)
      // Groups the app doesn't know about sort alphabetically, after the rest.
      if (ai === -1 && bi === -1) return a.localeCompare(b)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
    .map(([key, list]) => ({
      key,
      label:
        GROUP_META[key]?.label ?? key.charAt(0).toUpperCase() + key.slice(1),
      icon: GROUP_META[key]?.icon ?? KeyRound,
      permissions: list,
    }))
}

/**
 * The roles table defaults Color to #000000, which means "never picked" rather
 * than a deliberate black — show the neutral default instead.
 */
function roleColor(role?: Role | null) {
  const color = role?.color
  return !color || color === "#000000" ? DEFAULT_COLOR : color
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}

/** roleId → the permission ids it currently grants. */
type Matrix = Map<number, Set<number>>

function fingerprint(matrix: Matrix, roleIds: number[]) {
  return roleIds
    .map((id) => `${id}:${[...(matrix.get(id) ?? [])].sort((a, b) => a - b)}`)
    .join("|")
}

/* ---------- role name / colour form ---------- */

type FormState = { name: string; slug: string; color: string }

function RoleForm({
  editing,
  onSubmit,
  saving,
}: {
  editing: Role | null
  onSubmit: (form: FormState) => void
  saving: boolean
}) {
  const [form, setForm] = useState<FormState>(() =>
    editing
      ? { name: editing.name, slug: editing.slug, color: roleColor(editing) }
      : { name: "", slug: "", color: DEFAULT_COLOR }
  )
  // Only complain about a blank name once the user has tried to submit.
  const [attempted, setAttempted] = useState(false)
  const slugLocked = !!editing && PROTECTED_SLUGS.has(editing.slug)
  const nameInvalid = attempted && !form.name.trim()

  return (
    <>
      <FieldGroup>
        <Field data-invalid={nameInvalid || undefined}>
          <FieldLabel htmlFor="role-name">Name</FieldLabel>
          <Input
            id="role-name"
            value={form.name}
            aria-invalid={nameInvalid || undefined}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Contributor"
          />
        </Field>
        <Field data-disabled={slugLocked || undefined}>
          <FieldLabel htmlFor="role-slug">Slug</FieldLabel>
          <Input
            id="role-slug"
            value={form.slug}
            disabled={slugLocked}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="contributor"
          />
          <FieldDescription>
            {slugLocked
              ? "System roles keep their slug — the API checks it by name."
              : "Generated from the name when left blank."}
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="role-color">Colour</FieldLabel>
          <ToggleGroup
            id="role-color"
            type="single"
            value={form.color}
            onValueChange={(value) =>
              value && setForm((f) => ({ ...f, color: value }))
            }
          >
            {ROLE_COLORS.map((color) => (
              <ToggleGroupItem
                key={color}
                value={color}
                variant="outline"
                aria-label={`Colour ${color}`}
                className="size-9 p-0"
              >
                <span
                  className="size-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <FieldDescription>
            Used for the role badge on user lists.
          </FieldDescription>
        </Field>
      </FieldGroup>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={() => {
            setAttempted(true)
            onSubmit(form)
          }}
          disabled={saving}
        >
          {saving && <Spinner data-icon="inline-start" />}
          {editing ? "Save changes" : "Create role"}
        </Button>
      </DialogFooter>
    </>
  )
}

/* ---------- page ---------- */

function RolesPage() {
  const {
    data: roles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useListRolesDetailedQuery()
  const { data: permissions = [], isLoading: permissionsLoading } =
    useListPermissionsQuery()

  const [createRole, { isLoading: creating }] = useCreateRoleMutation()
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation()
  const [setRolePermissions, { isLoading: savingPermissions }] =
    useSetRolePermissionsMutation()
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation()

  const [search, setSearch] = useState("")
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [activeRoleId, setActiveRoleId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Role | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Role | null>(null)
  const [newRoleName, setNewRoleName] = useState("")

  const roleIds = useMemo(() => roles.map((role) => role.id), [roles])

  const serverMatrix = useMemo(() => {
    const matrix: Matrix = new Map()
    for (const role of roles) {
      matrix.set(role.id, new Set((role.permissions ?? []).map((p) => p.id)))
    }
    return matrix
  }, [roles])

  const serverKey = useMemo(
    () => fingerprint(serverMatrix, roleIds),
    [serverMatrix, roleIds]
  )

  // Unsaved ticks are tagged with the server state they were made against, so a
  // refetch or a completed save drops them without an effect.
  const [edits, setEdits] = useState<{ key: string; matrix: Matrix } | null>(
    null
  )
  const matrix = edits?.key === serverKey ? edits.matrix : serverMatrix

  const changedRoles = useMemo(
    () =>
      roles.filter((role) => {
        const before = [...(serverMatrix.get(role.id) ?? [])].sort(
          (a, b) => a - b
        )
        const after = [...(matrix.get(role.id) ?? [])].sort((a, b) => a - b)
        return before.join(",") !== after.join(",")
      }),
    [roles, serverMatrix, matrix]
  )
  const dirty = changedRoles.length > 0

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase()
    const matched = term
      ? permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.slug.toLowerCase().includes(term)
        )
      : permissions
    return groupPermissions(matched)
  }, [permissions, search])

  const assignedUsers = roles.reduce(
    (sum, role) => sum + (role.user_count ?? 0),
    0
  )

  function write(mutate: (next: Matrix) => void) {
    const next: Matrix = new Map()
    for (const [roleId, ids] of matrix) next.set(roleId, new Set(ids))
    mutate(next)
    setEdits({ key: serverKey, matrix: next })
  }

  function setCell(roleId: number, permissionId: number, checked: boolean) {
    write((next) => {
      const ids = next.get(roleId)
      if (!ids) return
      if (checked) ids.add(permissionId)
      else ids.delete(permissionId)
    })
  }

  function setGroupCells(
    roleId: number,
    group: PermissionGroup,
    checked: boolean
  ) {
    write((next) => {
      const ids = next.get(roleId)
      if (!ids) return
      for (const permission of group.permissions) {
        if (checked) ids.add(permission.id)
        else ids.delete(permission.id)
      }
    })
  }

  /** Tri-state for a group column: all / none / some granted. */
  function groupState(roleId: number, group: PermissionGroup) {
    const ids = matrix.get(roleId)
    if (!ids) return false
    const granted = group.permissions.filter((p) => ids.has(p.id)).length
    if (granted === 0) return false
    if (granted === group.permissions.length) return true
    return "indeterminate" as const
  }

  function toggleGroupCollapse(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function saveAll() {
    try {
      for (const role of changedRoles) {
        await setRolePermissions({
          id: role.id,
          permission_ids: [...(matrix.get(role.id) ?? [])],
        }).unwrap()
      }
      setEdits(null)
      toast.success(`Saved ${plural(changedRoles.length, "role")}`)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  async function submitRole(form: FormState) {
    const name = form.name.trim()
    if (!name) {
      toast.error("Name is required")
      return
    }
    const slug = form.slug.trim()

    try {
      if (editing) {
        await updateRole({
          id: editing.id,
          body: {
            name,
            slug: PROTECTED_SLUGS.has(editing.slug) ? undefined : slug,
            color: form.color,
          },
        }).unwrap()
        toast.success("Role updated")
      } else {
        await createRole({
          name,
          slug: slug || undefined,
          color: form.color,
        }).unwrap()
        toast.success("Role created")
      }
      setDialogOpen(false)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  async function quickCreate() {
    const name = newRoleName.trim()
    if (!name) return
    try {
      await createRole({ name }).unwrap()
      setNewRoleName("")
      toast.success("Role created")
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  async function duplicate(role: Role) {
    try {
      await createRole({
        name: `${role.name} copy`,
        permission_ids: (role.permissions ?? []).map((p) => p.id),
      }).unwrap()
      toast.success("Role duplicated")
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteRole(toDelete.id).unwrap()
      toast.success("Role deleted")
      setToDelete(null)
    } catch (e) {
      toast.error(apiError(e))
    }
  }

  const loading = rolesLoading || permissionsLoading
  const searching = !!search.trim()

  /** Column tint follows the pointer so a wide matrix stays readable. */
  const colClass = (roleId: number) =>
    cn(
      "border-l px-2 text-center",
      activeRoleId === roleId && "bg-muted/60",
      // PROTECTED_SLUGS.has(roles.find((r) => r.id === roleId)?.slug ?? "") &&
      //   "bg-muted/30"
    )

  return (
    <PageContainer
      title="Roles & Permissions"
      description={`${plural(roles.length, "role")} · ${plural(
        permissions.length,
        "permission"
      )} · ${plural(assignedUsers, "user")} assigned`}
      actions={
        <>
          <Button
            variant="ghost"
            size="sm"
            disabled={!dirty || savingPermissions}
            onClick={() => setEdits(null)}
          >
            Reset
          </Button>
          <Button
            size="sm"
            disabled={!dirty || savingPermissions}
            onClick={saveAll}
          >
            {savingPermissions && <Spinner data-icon="inline-start" />}
            {dirty ? `Save ${plural(changedRoles.length, "role")}` : "Saved"}
          </Button>
        </>
      }
    >
      {rolesError ? (
        <Alert variant="destructive">
          <ShieldCheck />
          <AlertTitle>Roles unavailable</AlertTitle>
          <AlertDescription>
            {apiError(rolesError, "Could not load roles.")}
          </AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : roles.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldCheck />
            </EmptyMedia>
            <EmptyTitle>No roles yet</EmptyTitle>
            <EmptyDescription>
              Create a role to start granting permissions to your team.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus data-icon="inline-start" />
            New Role
          </Button>
        </Empty>
      ) : (
        <div className="[&>div]:h-[calc(100vh-150px)]">
          <Table
            className="border-separate border-spacing-0"
            onMouseLeave={() => setActiveRoleId(null)}
          >
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-auto w-72 min-w-72 border-r border-b bg-background p-2">
                  <InputGroup>
                    <InputGroupAddon>
                      <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Type permission name"
                    />
                    {search && (
                      <InputGroupAddon align="inline-end">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Clear search"
                          onClick={() => setSearch("")}
                        >
                          <X />
                        </Button>
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                </TableHead>

                {roles.map((role) => {
                  const isProtected = PROTECTED_SLUGS.has(role.slug)
                  const inUse = (role.user_count ?? 0) > 0
                  return (
                    <TableHead
                      key={role.id}
                      className={cn(
                        "h-auto w-48 min-w-48 border-b p-2 align-top",
                        colClass(role.id)
                      )}
                      onMouseEnter={() => setActiveRoleId(role.id)}
                    >
                      <div className="flex items-start justify-between gap-1 text-left">
                        <div className="min-w-0">
                          <div className="text-xs font-normal text-muted-foreground">
                            Role
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="size-2 shrink-0 rounded-full"
                              style={{ backgroundColor: roleColor(role) }}
                            />
                            <span className="truncate">{role.name}</span>
                            {isProtected && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Lock className="size-3 shrink-0 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  System role — permissions are fixed
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <div className="truncate text-xs font-normal text-muted-foreground">
                            {role.slug} · {plural(role.user_count ?? 0, "user")}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions for ${role.name}`}
                            >
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditing(role)
                                  setDialogOpen(true)
                                }}
                              >
                                <Pencil />
                                Edit role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicate(role)}>
                                <Copy />
                                Duplicate role
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={isProtected || inUse}
                                onClick={() => setToDelete(role)}
                              >
                                <Trash2 />
                                Delete role
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableHead>
                  )
                })}

                <TableHead className="h-auto w-52 min-w-52 border-b border-l p-2 align-top">
                  <div className="text-xs font-normal text-muted-foreground">
                    New role
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <Input
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && quickCreate()}
                      placeholder="Role name"
                      className="h-8"
                    />
                    <Button
                      size="icon-sm"
                      aria-label="Create role"
                      disabled={!newRoleName.trim() || creating}
                      onClick={quickCreate}
                    >
                      {creating ? <Spinner /> : <Plus />}
                    </Button>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* <ScrollArea className="h-[calc(100vh-300px)] border w-full" ScrollBarProps={{ className: "hidden" }}> */}
              {groups.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={roles.length + 2} className="p-0">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <KeyRound />
                        </EmptyMedia>
                        <EmptyTitle>
                          {searching
                            ? "No matching permissions"
                            : "No permissions defined"}
                        </EmptyTitle>
                        <EmptyDescription>
                          {searching
                            ? `Nothing matches “${search.trim()}”.`
                            : "Seed the permissions table to start assigning access."}
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => {
                  const isCollapsed = collapsed.has(group.key) && !searching
                  const GroupIcon = group.icon
                  const Chevron = isCollapsed ? ChevronRight : ChevronDown

                  return (
                    <Fragment key={group.key}>
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableCell className="sticky left-0 z-10 border-r border-b bg-muted p-0">
                          <button
                            type="button"
                            onClick={() => toggleGroupCollapse(group.key)}
                            aria-expanded={!isCollapsed}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                          >
                            <Chevron className="size-4 text-muted-foreground" />
                            <GroupIcon className="size-4 text-muted-foreground" />
                            {group.label}
                            <span className="text-xs font-normal text-muted-foreground">
                              {group.permissions.length}
                            </span>
                          </button>
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell
                            key={role.id}
                            className={cn("border-b", colClass(role.id))}
                            onMouseEnter={() => setActiveRoleId(role.id)}
                          >
                            <Checkbox
                              checked={groupState(role.id, group)}
                              disabled={PROTECTED_SLUGS.has(role.slug)}
                              aria-label={`${group.label} for ${role.name}`}
                              onCheckedChange={(value) =>
                                setGroupCells(role.id, group, value === true)
                              }
                            />
                          </TableCell>
                        ))}
                        <TableCell className="border-b border-l" />
                      </TableRow>

                      {!isCollapsed &&
                        group.permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell className="sticky left-0 z-10 border-r border-b bg-background px-3 py-2">
                              <div className="font-medium">
                                {permission.name}
                              </div>
                              <div className="font-mono text-xs text-muted-foreground">
                                {permission.slug}
                              </div>
                            </TableCell>
                            {roles.map((role) => (
                              <TableCell
                                key={role.id}
                                className={cn("border-b", colClass(role.id))}
                                onMouseEnter={() => setActiveRoleId(role.id)}
                              >
                                <Checkbox
                                  checked={
                                    matrix.get(role.id)?.has(permission.id) ??
                                    false
                                  }
                                  disabled={PROTECTED_SLUGS.has(role.slug)}
                                  aria-label={`${permission.name} for ${role.name}`}
                                  onCheckedChange={(value) =>
                                    setCell(
                                      role.id,
                                      permission.id,
                                      value === true
                                    )
                                  }
                                />
                              </TableCell>
                            ))}
                            <TableCell className="border-b border-l" />
                          </TableRow>
                        ))}
                    </Fragment>
                  )
                })
              )}
            {/* </ScrollArea> */}
            </TableBody>
          </Table>
          </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit role" : "New role"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Rename the role or change how it is labelled across the panel."
                : "Create the role first, then tick its permissions in the grid."}
            </DialogDescription>
          </DialogHeader>
          {/* Keyed so the form re-initialises for whichever role is being
              edited; DialogContent unmounts on close, so it opens clean. */}
          <RoleForm
            key={editing?.id ?? "new"}
            editing={editing}
            onSubmit={submitRole}
            saving={creating || updating}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete role?</DialogTitle>
            <DialogDescription>
              “{toDelete?.name}” will be removed permanently. Roles still
              assigned to a user cannot be deleted.
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
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default RolesPage
