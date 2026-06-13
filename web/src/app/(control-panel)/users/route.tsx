import type { RouteItemType } from "@/types"
import PlaceholderPage from "@/shared/PlaceholderPage"

const route: RouteItemType = {
  path: "users",
  element: (
    <PlaceholderPage title="Users" description="Manage user accounts." />
  ),
  auth: ["admin"],
  settings: { page: { title: "Users" } },
}

export default route
