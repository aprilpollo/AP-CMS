import type { RouteItemType } from "@/types"
import PlaceholderPage from "@/shared/PlaceholderPage"

const route: RouteItemType = {
  path: "settings",
  element: (
    <PlaceholderPage title="Settings" description="Site configuration." />
  ),
  auth: ["admin"],
  settings: { page: { title: "Settings" } },
}

export default route
