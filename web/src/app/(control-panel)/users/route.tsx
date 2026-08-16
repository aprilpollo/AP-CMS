import type { RouteItemType } from "@/types"
import { Outlet } from "react-router"
import UsersListPage from "@/components/users/Table"
import UserDetailPage from "@/components/users/UserDetailPage"

const route: RouteItemType = {
  path: "users",
  element: <Outlet />,
  auth: ["admin"],
  children: [
    {
      index: true,
      element: <UsersListPage />,
      settings: { page: { title: "Users" } },
    },
    {
      path: ":id",
      element: <UserDetailPage />,
      settings: { page: { title: "User Detail" } },
    },
  ],
}

export default route
