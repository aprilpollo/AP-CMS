import type { RouteItemType } from "@/types"
import PlaceholderPage from "@/shared/PlaceholderPage"

const route: RouteItemType = {
  path: "pages",
  element: <PlaceholderPage title="Pages" description="Manage static pages." />,
  auth: ["admin", "editor"],
  settings: { page: { title: "Pages" } },
}

export default route
