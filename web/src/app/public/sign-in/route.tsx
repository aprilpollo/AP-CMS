import { type RouteItemType } from "@/types"
import { Navigate, Outlet } from "react-router"
import authRoles from "@/auth/roles"
import SignInPage from "./SignInPage"
import ForgotPasswordPage from "./ForgotPasswordPage"
import ResetPasswordPage from "./ResetPasswordPage"
import VerifyEmailPage from "./VerifyEmailPage"

const SignInPageRoute: RouteItemType = {
  path: "auth",
  element: <Outlet />,
  settings: {
    layout: {
      config: {
        navbar: {
          display: false,
        },
        toolbar: {
          display: false,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: false,
        },
        rightSidePanel: {
          display: false,
        },
      },
    },
  },
  auth: authRoles.onlyGuest,
  children: [
    {
      index: true,
      element: <Navigate to="/auth/sign-in" replace />,
    },
    {
      path: "sign-in",
      element: <SignInPage />,
      settings: {
        page: {
          title: "Sign In",
          description: "Please enter your credentials to access your account",
        },
      },
    },
    {
      path: "forgot-password",
      element: <ForgotPasswordPage />,
      settings: { page: { title: "Forgot Password" } },
    },
    {
      // Reachable from an emailed link, regardless of auth state.
      path: "reset-password",
      element: <ResetPasswordPage />,
      auth: null,
      settings: { page: { title: "Reset Password" } },
    },
    {
      path: "verify-email",
      element: <VerifyEmailPage />,
      auth: null,
      settings: { page: { title: "Verify Email" } },
    },
  ],
}

export default SignInPageRoute
