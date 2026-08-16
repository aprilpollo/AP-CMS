import type { RouteItemType } from "@/types"
import AnalyticsPage from "./AnalyticsPage"
import authRoles from "@/auth/roles"

const route: RouteItemType = {
  path: "analytics",
  element: <AnalyticsPage />,
  auth: authRoles.user,
  settings: {
    page: {
      title: "Analytics",
      description: "Traffic, sources and top content",
    },
  },
}

export default route
