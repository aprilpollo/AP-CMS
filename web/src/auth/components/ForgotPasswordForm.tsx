import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { z } from "zod"
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
import { authForgotPassword } from "@/auth/api/authApi"

const schema = z.object({
  email: z.string().email("You must enter a valid email"),
})

type FormValues = z.infer<typeof schema>

function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { email: "" },
    resolver: zodResolver(schema),
  })

  async function onSubmit({ email }: FormValues) {
    setIsLoading(true)
    try {
      await authForgotPassword(email)
    } catch {
      // The API always returns a generic success to avoid leaking which
      // emails exist — so show the same confirmation regardless.
    } finally {
      setIsLoading(false)
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          If an account exists for that address, we&apos;ve sent a password
          reset link. It expires in 1 hour.
        </p>
        <Button asChild variant="outline">
          <Link to="/auth/sign-in">Back to sign in</Link>
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
            <h1 className="text-2xl font-bold">Forgot password</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>
          <Field>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>
          </Field>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              to="/auth/sign-in"
              className="underline underline-offset-4"
            >
              Back to sign in
            </Link>
          </p>
        </FieldGroup>
      </form>
    </Form>
  )
}

export default ForgotPasswordForm
