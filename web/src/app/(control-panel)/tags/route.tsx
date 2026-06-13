import type { RouteItemType } from "@/types"
import TagsPage from "./TagsPage"

const route: RouteItemType = {
  path: "tags",
  element: <TagsPage />,
  auth: ["admin", "editor"],
  settings: { page: { title: "Tags" } },
}

export default route
