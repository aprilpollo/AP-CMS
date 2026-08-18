import type { RouteItemType } from "@/types"
import PreviewCreatePage from "./Page"

const route: RouteItemType = {
  path: "preview-new-user",
  element: <PreviewCreatePage />,
  auth: null,
}

export default route
