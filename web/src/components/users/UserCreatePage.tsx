import { useState } from "react"
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
import { ArrowLeft, Check, Dices, X } from "lucide-react"
import {
  useCheckEmailAvailableQuery,
  useCreateUserMutation,
  useListRolesQuery,
  useSendUserInviteMutation,
  useUploadUserAvatarMutation,
} from "@/store/api/cmsApi"
import { useDebounce } from "@/components/ui/multiselect"
import { apiError } from "@/utils/apiError"
import { Spinner } from "@/components/ui/spinner"

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
    role_id: z.string().min(1, "Select a role"),
    password: z
      .string()
      // Same rule as the Go validator (services.validPassword).
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain a letter")
      .regex(/[0-9]/, "Password must contain a digit"),
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
  // The cropped file is uploaded after the account exists, since the avatar
  // endpoint needs a user id.
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const { data: roles = [], isFetching: rolesLoading } = useListRolesQuery()
  const [createUser, { isLoading: creating }] = useCreateUserMutation()
  const [uploadAvatar] = useUploadUserAvatarMutation()
  const [sendInvite] = useSendUserInviteMutation()

  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      email: "",
      bio: "",
      role_id: "",
      password: "",
      confirmPassword: "",
      sendInvite: true,
    },
    resolver: zodResolver(schema),
  })

  // Inline e-mail check: only ask the API once the field parses as an address.
  const emailValue = form.watch("email")
  const emailProbe = useDebounce(emailValue?.trim() ?? "", 400)
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailProbe)
  const { data: emailCheck, isFetching: checkingEmail } =
    useCheckEmailAvailableQuery(emailProbe, { skip: !emailLooksValid })
  const emailTaken =
    emailLooksValid && emailCheck?.email === emailProbe && !emailCheck.available

  // Generates a password that satisfies the same rule the API enforces.
  const generatePassword = () => {
    const alphabet =
      "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*"
    const bytes = new Uint32Array(16)
    crypto.getRandomValues(bytes)
    let password = Array.from(bytes, (n) => alphabet[n % alphabet.length]).join(
      ""
    )
    // Guarantee the letter/digit requirement instead of hoping for it.
    if (!/[a-zA-Z]/.test(password)) password = "a" + password.slice(1)
    if (!/[0-9]/.test(password)) password = password.slice(0, -1) + "7"

    form.setValue("password", password, { shouldValidate: true })
    form.setValue("confirmPassword", password, { shouldValidate: true })
    navigator.clipboard?.writeText(password)
    toast.success("Password generated and copied to the clipboard")
  }

  const onSubmit = async (values: FormValues) => {
    if (emailTaken) {
      toast.error("Pick an email that is not in use yet")
      return
    }
    try {
      const user = await createUser({
        email: values.email,
        display_name: values.displayName,
        first_name: values.firstName,
        last_name: values.lastName,
        bio: values.bio || undefined,
        role_id: Number(values.role_id),
        password: values.password,
        // Invited accounts stay inactive until the user sets their own
        // password from the email link.
        is_active: false,
      }).unwrap()

      // Avatar and invite are follow-ups: the account is already created, so a
      // failure here is reported without throwing the whole flow away.
      if (avatarFile) {
        try {
          await uploadAvatar({ id: user.id, file: avatarFile }).unwrap()
        } catch (e) {
          toast.error(apiError(e, "The profile picture could not be uploaded"))
        }
      }

      if (values.sendInvite) {
        try {
          await sendInvite(user.id).unwrap()
          toast.success(`Invitation sent to ${user.email}`)
        } catch (e) {
          toast.error(apiError(e, "The invitation email could not be sent"))
        }
      }

      toast.success(`${user.display_name} has been created`)
      navigate(`/users/${user.id}`)
    } catch (e) {
      toast.error(apiError(e, "Could not create the user"))
    }
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
                    onAction={(file) => setAvatarFile(file)}
                    onRemove={() => setAvatarFile(null)}
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
                              aria-invalid={emailTaken || undefined}
                              {...field}
                            />
                          </FormControl>
                          {emailLooksValid && checkingEmail && (
                            <FormDescription>
                              Checking availability …
                            </FormDescription>
                          )}
                          {emailTaken && (
                            <p className="flex items-center gap-1 text-sm text-destructive">
                              <X className="size-3.5" />
                              This email already belongs to another account.
                            </p>
                          )}
                          {emailLooksValid && !checkingEmail && !emailTaken && (
                            <p className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                              <Check className="size-3.5" />
                              Email is available.
                            </p>
                          )}
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
                            <div className="flex items-center justify-between gap-2">
                              <FormLabel>Password</FormLabel>
                              <Button
                                type="button"
                                size="xs"
                                variant="ghost"
                                className="rounded-sm"
                                onClick={generatePassword}
                              >
                                <Dices />
                                Generate
                              </Button>
                            </div>
                            <FormControl>
                              <Input
                                type="password"
                                autoComplete="new-password"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              At least 8 characters, with a letter and a digit.
                            </FormDescription>
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
              <Button type="submit" disabled={creating || emailTaken}>
              {creating && <Spinner />}
              Create user
            </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageContainer>
  )
}

export default UserCreatePage
