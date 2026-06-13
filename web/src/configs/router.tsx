import type { RoutesType, RouteConfigType } from "@/types"
import { Navigate } from "react-router"
import { layoutConfigOnlyMain } from "./layoutConfigTemplates";
import Error401Page from "@/app/public/401/Error401Page"
import Error404Page from "@/app/public/404/Error404Page"
import ErrorBoundary from "@/components/error-boundary"
import settingsConfig from "./setting"

import App from "@/app/App"

const configModules: Record<string, unknown> = import.meta.glob(
  "/src/app/**/route.tsx",
  {
    eager: true,
  }
)

const mainRoutes: RouteConfigType[] = Object.keys(configModules)
  .map((modulePath) => {
    const moduleConfigs = (
      configModules[modulePath] as {
        default: RouteConfigType | RouteConfigType[]
      }
    ).default
    return Array.isArray(moduleConfigs) ? moduleConfigs : [moduleConfigs]
  })
  .flat()

const routes: RoutesType = [
  {
    path: "/",
    element: <App />,
    auth: settingsConfig.defaultAuth,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      ...mainRoutes,
      {
        path: "401",
        element: <Error401Page />,
        settings: { layout: layoutConfigOnlyMain },
        auth: null,
      },
      {
        path: "404",
        element: <Error404Page />,
        settings: { layout: layoutConfigOnlyMain },
        auth: null,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/404" />,
  },
]

export default routes
