import type { RouteItemType } from "@/types"
import PlaceholderPage from "@/shared/PlaceholderPage"

const route: RouteItemType = {
  path: "roles",
  element: (
    <PlaceholderPage
      title="Roles"
      description="Manage roles and permissions."
    />
  ),
  auth: ["admin"],
  settings: { page: { title: "Roles" } },
}

export default route
