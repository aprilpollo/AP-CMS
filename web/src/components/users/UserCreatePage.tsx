import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import PageContainer from "@/shared/PageContainer"
import AvatarUpload from "@/components/avatar-upload"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { addUser, userRoles, userStatuses, type UserStatus } from "./data"

const schema = z
  .object({
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
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    sendInvite: z.boolean(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

function UserCreatePage() {
  const navigate = useNavigate()
  const [avatarUrl, setAvatarUrl] = useState("")
  // The created user keeps the object URL, so it must survive this page.
  const keepAvatarRef = useRef(false)

  useEffect(() => {
    return () => {
      if (avatarUrl && !keepAvatarRef.current) URL.revokeObjectURL(avatarUrl)
    }
  }, [avatarUrl])

  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      email: "",
      bio: "",
      role: "Subscriber",
      status: "Active",
      password: "",
      confirmPassword: "",
      sendInvite: true,
    },
    resolver: zodResolver(schema),
  })

  const onSubmit = (values: FormValues) => {
    keepAvatarRef.current = true
    const user = addUser({
      firstName: values.firstName,
      lastName: values.lastName,
      displayName: values.displayName,
      email: values.email,
      role: values.role,
      status: values.status as UserStatus,
      bio: values.bio,
      avatar: avatarUrl,
    })
    toast.success(
      values.sendInvite
        ? `User created — invitation sent to ${user.email}`
        : "User created successfully"
    )
    navigate("/users")
  }

  // Suggest a display name while the user has not typed one themselves.
  const syncDisplayName = (firstName: string, lastName: string) => {
    if (form.formState.dirtyFields.displayName) return
    form.setValue("displayName", `${firstName} ${lastName}`.trim(), {
      shouldValidate: form.formState.isSubmitted,
    })
  }

  return (
    <PageContainer
      title="Add User"
      description="Create a new account and set its permissions."
      actions={
        <Button
          size="sm"
          variant="ghost"
          className="rounded-sm"
          onClick={() => navigate("/users")}
        >
          <ArrowLeft />
          Back
        </Button>
      }
    >
      <div className="border-t">
        <Form {...form}>
          <form
            className="max-w-3xl space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Card className="ring-0 bg-background">
              <CardHeader>
                <CardTitle>Account details</CardTitle>
                <CardDescription>
                  Basic information shown across the control panel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-4">
                  <AvatarUpload
                    onAction={(file) => setAvatarUrl(URL.createObjectURL(file))}
                    onRemove={() => setAvatarUrl("")}
                  />
                  <div>
                    <p className="font-medium">Profile Picture</p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, GIF up to 10MB. Optional — initials are used
                      when empty.
                    </p>
                  </div>
                </div>
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
                              <Input
                                placeholder="Alex"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  syncDisplayName(
                                    e.target.value,
                                    form.getValues("lastName")
                                  )
                                }}
                              />
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
                              <Input
                                placeholder="Thompson"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  syncDisplayName(
                                    form.getValues("firstName"),
                                    e.target.value
                                  )
                                }}
                              />
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
                            <Input placeholder="Alex Thompson" {...field} />
                          </FormControl>
                          <FormDescription>
                            Shown as the author name on posts and comments.
                          </FormDescription>
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
                            <Input
                              type="email"
                              placeholder="alex.t@company.com"
                              {...field}
                            />
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
                            <Textarea
                              rows={3}
                              placeholder="A short description of this user."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card className="ring-0 bg-background">
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Set a temporary password for the first sign in.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                autoComplete="new-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                    <Field>
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                autoComplete="new-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                  </div>

                  <Separator />

                  <Field>
                    <FormField
                      control={form.control}
                      name="sendInvite"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between gap-4">
                          <div>
                            <FormLabel>Send invitation email</FormLabel>
                            <FormDescription>
                              Email the sign in details to the new user.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/users")}
              >
                Cancel
              </Button>
              <Button type="submit">Create user</Button>
            </div>
          </form>
        </Form>
      </div>
    </PageContainer>
  )
}

export default UserCreatePage
