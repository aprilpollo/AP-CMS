import type { RouteItemType } from "@/types"
import MediaPage from "./MediaPage"

const route: RouteItemType = {
  path: "media",
  element: <MediaPage />,
  auth: ["admin", "editor", "author"],
  settings: { page: { title: "Media" } },
}

export default route
