import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export default function Security() {
  return (
    <main className="pl-1">
      <header className="border-b p-4">
        <h1 className="text-2xl">Security</h1>
        <p className="text-sm text-muted-foreground">
          Manage your password and account protection.
        </p>
      </header>
      <PasswordForm />
      <Separator />
      <TwoFactorSection />
    </main>
  )
}

const schema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be less than 72 characters"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })

type FormValues = z.infer<typeof schema>

function PasswordForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true)
      // TODO: wire to change-password endpoint
      console.log("change password", data)
      await new Promise((resolve) => setTimeout(resolve, 600))
      form.reset()
      toast.success("Password updated successfully")
    } catch (error) {
      toast.error((error as Error).message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4 p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
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
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
          <Field>
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
        </FieldGroup>
        <footer className="flex justify-end pt-4">
          <Button type="submit" disabled={!form.formState.isDirty || isLoading}>
            Update Password
            {isLoading && <LoaderCircle className="animate-spin" />}
          </Button>
        </footer>
      </form>
    </Form>
  )
}

function TwoFactorSection() {
  const [enabled, setEnabled] = useState(false)

  const onToggle = (value: boolean) => {
    setEnabled(value)
    toast.success(
      value
        ? "Two-factor authentication enabled"
        : "Two-factor authentication disabled"
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Two-Factor Authentication</Label>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security to your account.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
    </div>
  )
}
