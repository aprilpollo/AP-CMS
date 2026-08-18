import type { RouteItemType } from "@/types"
import UsersListPage from "@/components/users/Table"

const route: RouteItemType = {
  path: "preview-users",
  element: <UsersListPage />,
  auth: null,
}

export default route
