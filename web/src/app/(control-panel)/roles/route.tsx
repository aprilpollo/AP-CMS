import type { RouteItemType } from "@/types"
import RolesPage from "./RolesPage"

const route: RouteItemType = {
  path: "roles",
  element: <RolesPage />,
  auth: ["admin"],
  settings: { page: { title: "Roles & Permissions" } },
}

export default route
