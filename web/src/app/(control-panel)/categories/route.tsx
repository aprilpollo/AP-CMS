import type { RouteItemType } from "@/types"
import CategoriesPage from "./CategoriesPage"

const route: RouteItemType = {
  path: "categories",
  element: <CategoriesPage />,
  auth: ["admin", "editor"],
  settings: { page: { title: "Categories" } },
}

export default route
