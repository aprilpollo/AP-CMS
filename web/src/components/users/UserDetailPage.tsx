import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import PageContainer from "@/shared/PageContainer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldGroup } from "@/components/ui/field"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ClockFading,
  Copy,
  Ellipsis,
  KeyRound,
  LogOut,
  Mail,
  MessageSquare,
  Monitor,
  ScrollText,
  ShieldCheck,
  ShieldUser,
  TrashIcon,
  User,
  UserX,
} from "lucide-react"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  useDeleteUserMutation,
  useGetUserQuery,
  useListRolesQuery,
  useListUserActivityQuery,
  useListUserSessionsQuery,
  useRevokeUserSessionMutation,
  useSendUserInviteMutation,
  useSetUserPasswordMutation,
  useUpdateUserMutation,
  useUploadUserAvatarMutation,
} from "@/store/api/cmsApi"
import { apiError } from "@/utils/apiError"
import type { UserAccount } from "@/types/cms"
import AvatarUpload from "@/components/avatar-upload"

function fullName(user: UserAccount) {
  const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
  return name || user.display_name || user.email
}

function formatDate(value?: string | null) {
  if (!value) return "Never"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Never" : format(date, "MMM dd yyyy, p")
}

const schema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters"),
  email: z.string().email("Enter a valid email address"),
  bio: z.string().max(160, "Bio must be less than 160 characters"),
  role_id: z.string().min(1, "Select a role"),
  status: z.enum(["Active", "Inactive"]),
})

type FormValues = z.infer<typeof schema>

function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useGetUserQuery(id ?? "", {
    skip: !id,
  })
  const [updateUser] = useUpdateUserMutation()
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation()

  const setActive = async (isActive: boolean) => {
    if (!user) return
    try {
      await updateUser({ id: user.id, body: { is_active: isActive } }).unwrap()
      toast.success(isActive ? "User activated" : "User deactivated")
    } catch (e) {
      toast.error(apiError(e, "Could not update the user"))
    }
  }

  if (isLoading) {
    return (
      <PageContainer title="User">
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </PageContainer>
    )
  }

  if (isError || !user) {
    return (
      <PageContainer title="User not found">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserX />
            </EmptyMedia>
            <EmptyTitle>User not found</EmptyTitle>
            <EmptyDescription>
              {isError
                ? apiError(error, "This user could not be loaded.")
                : "The user you are looking for does not exist or has been removed."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => navigate("/users")}>
              <ArrowLeft />
              Back to users
            </Button>
          </EmptyContent>
        </Empty>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={user.display_name || fullName(user)}
      description={user.email}
      actions={
        <>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-sm"
            onClick={() => navigate("/users")}
          >
            <ArrowLeft />
            Back
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon-sm"
                variant="outline"
                className="rounded-sm"
                aria-label="Open user actions"
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={() => {
                    navigator.clipboard?.writeText(user.email)
                    toast.success("Email copied to clipboard")
                  }}
                >
                  <Copy />
                  Copy email
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setActive(!user.is_active)}>
                  <KeyRound />
                  {user.is_active ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setConfirmDelete(true)}
                >
                  <TrashIcon />
                  Delete user
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <UserSummaryCard user={user} />

        <Tabs defaultValue="profile" className="min-w-0">
          <TabsList>
            <TabsTrigger value="profile" className="cursor-pointer">
              <User />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="cursor-pointer">
              <ShieldCheck />
              Security
            </TabsTrigger>
            <TabsTrigger value="activity" className="cursor-pointer">
              <ClockFading />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab user={user} />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab
              user={user}
              onDelete={() => setConfirmDelete(true)}
              onToggleActive={setActive}
            />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityTab user={user} />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {fullName(user)} ({user.email})?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={async () => {
                try {
                  await deleteUser(user.id).unwrap()
                } catch (e) {
                  toast.error(apiError(e, "Could not delete the user"))
                  return
                }
                setConfirmDelete(false)
                toast.success("User deleted")
                navigate("/users")
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

function UserSummaryCard({ user }: { user: UserAccount }) {
  const [uploadAvatar, { isLoading: uploading }] = useUploadUserAvatarMutation()

  const changeAvatar = async (file: File) => {
    try {
      await uploadAvatar({ id: user.id, file }).unwrap()
      toast.success("Profile picture updated")
    } catch (e) {
      toast.error(apiError(e, "The picture could not be uploaded"))
    }
  }

  return (
    <Card className="h-fit bg-background ring-0">
      <CardContent className="flex flex-col items-center gap-2 text-center">
        <AvatarUpload
          defaultImageUrl={user.avatar_url ?? undefined}
          onAction={changeAvatar}
        />
        {uploading && (
          <span className="text-xs text-muted-foreground">Uploading …</span>
        )}
        <div>
          <p className="font-medium">{user.display_name || fullName(user)}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline">
            <ShieldUser />
            {user.role?.name ?? "No role"}
          </Badge>
          <Badge variant={user.is_active ? "default" : "secondary"}>
            {user.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardContent>

      <Separator />

      <CardContent className="space-y-2 text-sm">
        <SummaryRow
          icon={<CalendarDays className="size-4 text-muted-foreground" />}
          label="Joined"
          value={formatDate(user.created_at)}
        />
        <SummaryRow
          icon={<Clock className="size-4 text-muted-foreground" />}
          label="Last login"
          value={formatDate(user.last_login_at)}
        />
        <SummaryRow
          icon={<ScrollText className="size-4 text-muted-foreground" />}
          label="User ID"
          value={String(user.id)}
        />
        <SummaryRow
          icon={<MessageSquare className="size-4 text-muted-foreground" />}
          label="Updated"
          value={formatDate(user.updated_at)}
        />
      </CardContent>
    </Card>
  )
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </div>
      <span className="truncate font-medium">{value}</span>
    </div>
  )
}

function ProfileTab({ user }: { user: UserAccount }) {
  const { data: roles = [], isFetching: rolesLoading } = useListRolesQuery()
  const [updateUser, { isLoading: saving }] = useUpdateUserMutation()

  const form = useForm<FormValues>({
    mode: "onChange",
    values: {
      firstName: user.first_name ?? "",
      lastName: user.last_name ?? "",
      displayName: user.display_name ?? "",
      email: user.email,
      bio: user.bio ?? "",
      role_id: String(user.role_id ?? ""),
      status: user.is_active ? ("Active" as const) : ("Inactive" as const),
    },
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await updateUser({
        id: user.id,
        body: {
          email: values.email,
          display_name: values.displayName,
          first_name: values.firstName,
          last_name: values.lastName,
          bio: values.bio,
          role_id: Number(values.role_id),
          is_active: values.status === "Active",
        },
      }).unwrap()
      form.reset(values)
      toast.success("Profile updated successfully")
    } catch (e) {
      toast.error(apiError(e, "Could not save the profile"))
    }
  }

  return (
    <Card className="bg-background ring-0">
      <CardHeader className="px-1">
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update the account details and permissions for this user.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>
                <Field>
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>
              </div>

              <Field>
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              <Field>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FormField
                    control={form.control}
                    name="role_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  rolesLoading
                                    ? "Loading roles …"
                                    : "Select a role"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {roles.map((role) => (
                                <SelectItem
                                  key={role.id}
                                  value={String(role.id)}
                                >
                                  {role.name}
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
                <Field>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {["Active", "Inactive"].map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
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
              </div>

              <Field>
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>
            </FieldGroup>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!form.formState.isDirty}
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isDirty || saving}
              >
                {saving && <Spinner />}
                Save changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function SecurityTab({
  user,
  onDelete,
  onToggleActive,
}: {
  user: UserAccount
  onDelete: () => void
  onToggleActive: (isActive: boolean) => void
}) {
  const [newPassword, setNewPassword] = useState("")
  const [setUserPassword, { isLoading: savingPassword }] =
    useSetUserPasswordMutation()
  const { data: sessions = [], isLoading: sessionsLoading } =
    useListUserSessionsQuery(user.id)
  const [revokeSession, { isLoading: revoking }] =
    useRevokeUserSessionMutation()
  const [sendInvite, { isLoading: sendingInvite }] = useSendUserInviteMutation()

  const revoke = async (sessionId: string) => {
    try {
      await revokeSession({ id: user.id, sessionId }).unwrap()
      toast.success("Session revoked")
    } catch (e) {
      toast.error(apiError(e, "Could not revoke the session"))
    }
  }

  const invite = async () => {
    try {
      await sendInvite(user.id).unwrap()
      toast.success(`Password link sent to ${user.email}`)
    } catch (e) {
      toast.error(apiError(e, "The email could not be sent"))
    }
  }

  const submitPassword = async () => {
    try {
      await setUserPassword({ id: user.id, password: newPassword }).unwrap()
      setNewPassword("")
      toast.success("Password updated")
    } catch (e) {
      toast.error(apiError(e, "Could not update the password"))
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-background ring-0">
        <CardHeader className="px-1">
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            Manage how {user.first_name} signs in to the control panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-1">
          <div className="space-y-4">
            <div className="min-w-0">
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Set a new password for {user.email}. At least 8 characters with
                a letter and a digit.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="New password"
                className="w-56"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <Button
                variant="outline"
                disabled={newPassword.length < 8 || savingPassword}
                onClick={submitPassword}
              >
                {savingPassword ? <Spinner /> : <KeyRound />}
                Update
              </Button>
              <Button
                variant="ghost"
                disabled={sendingInvite}
                onClick={invite}
                title="Email a one-time link so the user can set it themselves"
              >
                {sendingInvite ? <Spinner /> : <Mail />}
                Email link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background ring-0">
        <CardHeader className="px-1">
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>
            Devices that are currently signed in to this account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-1">
          {sessionsLoading && <Skeleton className="h-12 w-full" />}

          {!sessionsLoading && sessions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No active sessions. The user is signed out everywhere.
            </p>
          )}

          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Monitor className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {session.user_agent || "Unknown device"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.ip || "unknown ip"} · last seen{" "}
                    {formatDate(session.last_seen_at)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={revoking}
                onClick={() => revoke(session.id)}
              >
                <LogOut />
                Revoke
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-background ring-0">
        <CardHeader className="px-1">
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Deactivating keeps the content but blocks sign in. Deleting removes
            the account permanently.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 px-1">
          <Button
            variant="outline"
            onClick={() => onToggleActive(!user.is_active)}
          >
            <UserX />
            {user.is_active ? "Deactivate user" : "Activate user"}
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            <TrashIcon />
            Delete user
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ActivityTab({ user }: { user: UserAccount }) {
  const { data: records = [], isLoading } = useListUserActivityQuery({
    id: user.id,
    limit: 30,
  })

  return (
    <Card className="bg-background ring-0">
      <CardHeader className="px-1">
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          Audit entries recorded for this account, newest first.
        </CardDescription>
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-300px)]" ScrollBarProps={{ className: "hidden" }}>
        <CardContent className="px-1">
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          )}

          {!isLoading && records.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing recorded yet. Sign-ins and content changes show up here.
            </p>
          )}

          {records.length > 0 && (
            <ol className="relative space-y-4 border-l pl-4">
              {records.map((record) => (
                <li key={record.id} className="relative">
                  <span className="absolute top-1.5 -left-5.25 size-2 rounded-full bg-border ring-4 ring-background" />
                  <p className="font-medium">
                    {record.action_name || record.action_code}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {record.entity_type}
                    {record.entity_id ? ` #${record.entity_id}` : ""}
                    {record.ip ? ` · ${record.ip}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(record.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

export default UserDetailPage
