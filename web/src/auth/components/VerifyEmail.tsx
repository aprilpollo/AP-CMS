import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "@/shared/Link"
import { authVerifyEmail } from "@/auth/api/authApi"
import { FetchApiError } from "@/utils/apiFetch"

type Status = "loading" | "success" | "error"

function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const [status, setStatus] = useState<Status>(token ? "loading" : "error")
  const [message, setMessage] = useState(
    token ? "" : "This verification link is missing its token."
  )
  const ran = useRef(false)

  useEffect(() => {
    if (!token || ran.current) return
    ran.current = true

    authVerifyEmail(token)
      .then(() => setStatus("success"))
      .catch((error) => {
        const data = (error as FetchApiError).data as {
          error?: string | null
          message?: string
        }
        setStatus("error")
        setMessage(
          data?.error ||
            data?.message ||
            "Verification failed or the link has expired."
        )
      })
  }, [token])

  return (
    <div className="flex flex-col gap-4 text-center">
      {status === "loading" && (
        <>
          <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Verifying your email…</p>
        </>
      )}
      {status === "success" && (
        <>
          <h1 className="text-2xl font-bold">Email verified</h1>
          <p className="text-sm text-muted-foreground">
            Your new email address is now active.
          </p>
          <Button asChild>
            <Link to="/auth/sign-in">Continue to sign in</Link>
          </Button>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold">Verification failed</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          <Button asChild variant="outline">
            <Link to="/auth/sign-in">Back to sign in</Link>
          </Button>
        </>
      )}
    </div>
  )
}

export default VerifyEmail
