import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import PageContainer from "@/shared/PageContainer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
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
  MessageSquare,
  Monitor,
  ScrollText,
  ShieldCheck,
  ShieldUser,
  TrashIcon,
  User,
  UserX,
} from "lucide-react"
import {
  getUserById,
  userActivities,
  userRoles,
  userSessions,
  userStatuses,
  type UserItem,
  type UserStatus,
} from "./data"

const statusVariant: Record<UserStatus, "default" | "secondary" | "outline"> = {
  Active: "default",
  Inactive: "secondary",
  Pending: "outline",
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
  role: z.string().min(1, "Select a role"),
  status: z.enum(["Active", "Inactive", "Pending"]),
})

type FormValues = z.infer<typeof schema>

function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const found = getUserById(id)
  const [user, setUser] = useState<UserItem | undefined>(found)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!user) {
    return (
      <PageContainer title="User not found">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserX />
            </EmptyMedia>
            <EmptyTitle>User not found</EmptyTitle>
            <EmptyDescription>
              The user you are looking for does not exist or has been removed.
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
      title={user.displayName}
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
                <DropdownMenuItem
                  onSelect={() => toast.success("Password reset link sent")}
                >
                  <KeyRound />
                  Reset password
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
            <ProfileTab user={user} onSave={setUser} />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab user={user} onDelete={() => setConfirmDelete(true)} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityTab />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {user.displayName}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
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

function UserSummaryCard({ user }: { user: UserItem }) {
  return (
    <Card className="h-fit ring-0">
      <CardContent className="flex flex-col items-center gap-2 text-center">
        <Avatar className="size-16">
          <AvatarImage src={user.avatar} alt={user.displayName} />
          <AvatarFallback>
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.displayName}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline">
            <ShieldUser />
            {user.role}
          </Badge>
          <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
        </div>
      </CardContent>

      <Separator />

      <CardContent className="space-y-2 text-sm">
        <SummaryRow
          icon={<CalendarDays className="size-4 text-muted-foreground" />}
          label="Joined"
          value={user.joinDate}
        />
        <SummaryRow
          icon={<Clock className="size-4 text-muted-foreground" />}
          label="Last active"
          value={user.lastActive}
        />
        <SummaryRow
          icon={<ScrollText className="size-4 text-muted-foreground" />}
          label="Posts"
          value={String(user.posts)}
        />
        <SummaryRow
          icon={<MessageSquare className="size-4 text-muted-foreground" />}
          label="Comments"
          value={String(user.comments)}
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

function ProfileTab({
  user,
  onSave,
}: {
  user: UserItem
  onSave: (user: UserItem) => void
}) {
  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      email: user.email,
      bio: user.bio,
      role: user.role,
      status: user.status,
    },
    resolver: zodResolver(schema),
  })

  const onSubmit = (values: FormValues) => {
    onSave({ ...user, ...values })
    form.reset(values)
    toast.success("Profile updated successfully")
  }

  return (
    <Card className="ring-0">
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
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {userRoles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
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
                              {userStatuses.map((status) => (
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
              <Button type="submit" disabled={!form.formState.isDirty}>
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
}: {
  user: UserItem
  onDelete: () => void
}) {
  const [twoFactor, setTwoFactor] = useState(false)

  return (
    <div className="space-y-4">
      <Card className="ring-0">
        <CardHeader className="px-1">
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            Manage how {user.firstName} signs in to the control panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Send a reset link to {user.email}.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => toast.success("Password reset link sent")}
            >
              <KeyRound />
              Reset password
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Two-factor authentication</p>
              <p className="text-sm text-muted-foreground">
                Require a verification code at sign in.
              </p>
            </div>
            <Switch
              checked={twoFactor}
              onCheckedChange={(checked) => {
                setTwoFactor(checked)
                toast.success(
                  checked
                    ? "Two-factor authentication enabled"
                    : "Two-factor authentication disabled"
                )
              }}
              aria-label="Toggle two-factor authentication"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="ring-0">
        <CardHeader className="px-1">
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>
            Devices that are currently signed in to this account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-1">
          {userSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Monitor className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-medium">
                    {session.device}
                    {session.current && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.location} · {session.lastSeen}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.success("Session revoked")}
              >
                <LogOut />
                Revoke
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="ring-0">
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
            onClick={() => toast.success("User deactivated")}
          >
            <UserX />
            Deactivate user
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

function ActivityTab() {
  return (
    <Card className="ring-0">
      <CardHeader className="px-1">
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          The latest actions recorded for this account.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1">
        <ol className="relative space-y-4 border-l pl-4">
          {userActivities.map((activity) => (
            <li key={activity.id} className="relative">
              <span className="absolute top-1.5 -left-5.25 size-2 rounded-full bg-border ring-4 ring-background" />
              <p className="font-medium">{activity.title}</p>
              <p className="text-sm text-muted-foreground">
                {activity.description}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {activity.timestamp}
              </p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

export default UserDetailPage
