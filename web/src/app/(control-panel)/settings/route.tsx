import { Navigate } from "react-router"
import type { RouteItemType } from "@/types"
import Setting from "./Setting"
import Account from "./account/Account"
import Security from "./security/Security"
import Notifications from "./notifications/Notifications"
import Appearance from "./appearance/Appearance"
import Team from "./team/Team"
import Integrations from "./integrations/Integrations"

const route: RouteItemType = {
  path: "settings",
  element: <Setting />,
  children: [
    {
      index: true,
      element: <Navigate to="account" replace />,
    },
    {
      path: "account",
      element: <Account />,
      settings: {
        page: { title: "Account" },
      },
    },
    {
      path: "security",
      element: <Security />,
      settings: {
        page: { title: "Security" },
      },
    },
    {
      path: "notifications",
      element: <Notifications />,
      settings: {
        page: { title: "Notifications" },
      },
    },
    {
      path: "appearance",
      element: <Appearance />,
      settings: {
        page: { title: "Appearance" },
      },
    },
    {
      path: "team",
      element: <Team />,
      settings: {
        page: { title: "Team" },
      },
    },
    {
      path: "integrations",
      element: <Integrations />,
      settings: {
        page: { title: "Integrations" },
      },
    },
  ],
  settings: {
    page: { title: "Settings" },
    layout: { config: { leftSidePanel: { display: false } } },
  },
}

export default route
