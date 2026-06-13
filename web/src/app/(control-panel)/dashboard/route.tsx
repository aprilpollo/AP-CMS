import type { RouteItemType } from "@/types"
import Dashboard from "@/app/(control-panel)/dashboard/page"
import authRoles from "@/auth/roles"

const DashboardRoute: RouteItemType = {
  path: "dashboard",
  element: <Dashboard />,
  auth: authRoles.user,
  settings: {
    page: {
      title: "Dashboard",
      description: "Starter dashboard page",
    },
  },
}

export default DashboardRoute
