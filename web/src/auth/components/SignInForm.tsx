import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { z } from "zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Field,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "@/shared/Link"
import { FetchApiError } from "@/utils/apiFetch"
import { type SignInPayload } from "../providers/JwtAuthProvider"
import useAuth from "../context/useJwtAuth"

const schema = z.object({
  email: z
    .string()
    .email("You must enter a valid email")
    .min(1, "You must enter an email"),
  password: z
    .string()
    .min(4, "Password is too short - must be at least 4 chars.")
    .min(1, "Please enter your password."),
})

const defaultValues = {
  email: "alice@example.com",
  password: "Password123",
}

function SignInForm() {
  const { signIn } = useAuth()
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignInPayload>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  })

  const { setError } = form

  function onSubmit(formData: SignInPayload) {
    const { email, password } = formData

    setIsLoading(true)
    signIn({ email, password })
      .catch((error: FetchApiError) => {
        const errorData = error.data as {
          code?: number
          error?: string | null
          message?: string
        }
        setError("password", {
          type: "manual",
          message:
            errorData?.error || errorData?.message || "Something went wrong",
        })
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your email below to login to your account
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      to="/auth/forgot-password"
                      className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="********"
                        {...field}
                        type={isShowPassword ? "text" : "password"}
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => setIsShowPassword((prev) => !prev)}
                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                      >
                        {isShowPassword ? (
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sign in..." : "Sign in"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </Form>
  )
}

export default SignInForm
