import SignInForm from "@/auth/components/SignInForm"
import AuthShell from "@/auth/components/AuthShell"

function SignInPage() {
  return (
    <AuthShell>
      <SignInForm />
    </AuthShell>
  )
}

export default SignInPage
