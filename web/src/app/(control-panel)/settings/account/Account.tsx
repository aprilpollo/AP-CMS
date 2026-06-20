import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Field, FieldGroup } from "@/components/ui/field"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import AvatarUpload from "@/components/avatar-upload"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile, getProfile, updateAvatar } from "@/store/api/user"
import { toast } from "sonner"
import useUser from "@/auth/hooks/useUser"
import useJwtAuth from "@/auth/context/useJwtAuth"
import { LoaderCircle } from "lucide-react"

export default function Account() {
  return (
    <main className="pl-1">
      <header className="border-b p-4">
        <h1 className="text-2xl">Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings.
        </p>
      </header>
      <AccountForm />
    </main>
  )
}

const schema = z.object({
  display_name: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters"),
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
})

type FormValues = z.infer<typeof schema>

function AccountForm() {
  const { data: user } = useUser()
  const { setUser } = useJwtAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      display_name: user?.display_name || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      bio: user?.bio || "",
    },
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true)
      await updateProfile(data)
      const res = await getProfile()
      const { payload } = await res.json()
      setUser({ ...payload.user, permissions: payload.permissions })
      form.reset(data)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error((error as Error).message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const onAction = async (file: File) => {
    try {
      await updateAvatar(file)
      const res = await getProfile()
      const { payload } = await res.json()
      setUser({ ...payload.user, permissions: payload.permissions })
      toast.success("Avatar updated successfully")
    } catch (error) {
      toast.error((error as Error).message || "An error occurred")
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4 p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center gap-4">
          <AvatarUpload defaultImageUrl={user?.avatar_url} onAction={onAction} />
          <div>
            <p>Profile Picture</p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, GIF up to 10MB.
            </p>
          </div>
        </div>
        <FieldGroup>
          <Field>
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
        </FieldGroup>

        <FieldGroup className="grid grid-cols-2 gap-4">
          <Field>
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
          <Field>
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Short bio about yourself"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
        </FieldGroup>
        <footer className="flex justify-end pt-4">
          <Button type="submit" disabled={!form.formState.isDirty || isLoading}>
            Save Changes
            {isLoading && <LoaderCircle className="animate-spin" /> }
          </Button>
        </footer>
      </form>
    </Form>
  )
}
