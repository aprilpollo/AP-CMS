import type { RouteItemType } from "@/types"
import ConnectionsPage from "./ConnectionsPage"

const route: RouteItemType = {
  path: "connections",
  element: <ConnectionsPage />,
  auth: ["admin"],
  settings: {
    page: {
      title: "Connections",
      description: "Sites allowed to pull content from this CMS",
    },
  },
}

export default route
