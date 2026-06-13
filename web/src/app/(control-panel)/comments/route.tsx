import type { RouteItemType } from "@/types"
import PlaceholderPage from "@/shared/PlaceholderPage"

const route: RouteItemType = {
  path: "comments",
  element: (
    <PlaceholderPage title="Comments" description="Moderate comments." />
  ),
  auth: ["admin", "editor"],
  settings: { page: { title: "Comments" } },
}

export default route
