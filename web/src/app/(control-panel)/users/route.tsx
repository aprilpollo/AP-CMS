import type { RouteItemType } from "@/types"
import UsersListPage from "@/components/users/Table"

const route: RouteItemType = {
  path: "users",
  element: <UsersListPage />,
  auth: ["admin"],
  settings: { page: { title: "Users" } },
}

export default route
