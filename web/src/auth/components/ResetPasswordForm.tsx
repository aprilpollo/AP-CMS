import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { z } from "zod"
import { useSearchParams } from "react-router"
import { EyeIcon, EyeOffIcon } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import Link from "@/shared/Link"
import { authResetPassword } from "@/auth/api/authApi"
import { FetchApiError } from "@/utils/apiFetch"

const schema = z
  .object({
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Must contain at least one letter")
      .regex(/[0-9]/, "Must contain at least one digit"),
    confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  })

type FormValues = z.infer<typeof schema>

function ResetPasswordForm() {
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const [isLoading, setIsLoading] = useState(false)
  const [isShow, setIsShow] = useState(false)
  const [done, setDone] = useState(false)

  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { new_password: "", confirm: "" },
    resolver: zodResolver(schema),
  })

  async function onSubmit({ new_password }: FormValues) {
    setIsLoading(true)
    try {
      await authResetPassword(token, new_password)
      setDone(true)
    } catch (error) {
      const data = (error as FetchApiError).data as {
        error?: string | null
        message?: string
      }
      form.setError("new_password", {
        type: "manual",
        message: data?.error || data?.message || "Reset failed",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-bold">Invalid link</h1>
        <p className="text-sm text-muted-foreground">
          This reset link is missing its token. Please request a new one.
        </p>
        <Button asChild variant="outline">
          <Link to="/auth/forgot-password">Request a new link</Link>
        </Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-bold">Password updated</h1>
        <p className="text-sm text-muted-foreground">
          You can now sign in with your new password.
        </p>
        <Button asChild>
          <Link to="/auth/sign-in">Continue to sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Reset password</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter a new password for your account
            </p>
          </div>
          <Field>
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="********"
                        {...field}
                        type={isShow ? "text" : "password"}
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => setIsShow((p) => !p)}
                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                      >
                        {isShow ? (
                          <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
          <Field>
            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="********"
                      type={isShow ? "text" : "password"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update password"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </Form>
  )
}

export default ResetPasswordForm
