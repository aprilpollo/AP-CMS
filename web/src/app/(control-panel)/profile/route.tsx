import type { RouteItemType } from "@/types"
import PlaceholderPage from "@/shared/PlaceholderPage"

const route: RouteItemType = {
  path: "profile",
  element: (
    <PlaceholderPage
      title="My Profile"
      description="Update your profile and account."
    />
  ),
  auth: ["admin", "editor", "author", "subscriber"],
  settings: { page: { title: "My Profile" } },
}

export default route
