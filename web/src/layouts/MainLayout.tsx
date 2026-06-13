import { memo, useMemo, type ReactNode } from "react"
import { type LayoutConfigDefaultsType } from "@/layouts/configs/LayoutConfig"
import { Outlet } from "react-router"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/AppSidebar"
import { AppHeader } from "./components/AppHeader"
import { Helmet } from "react-helmet-async"
// import { ScrollArea } from "@/components/ui/scroll-area"
import useLayoutSettings from "@/layouts/hooks/useLayoutSettings"
import useSettings from "@/settings/hooks/useSettings"
// import Loading from "@/shared/Loading"

type LayoutProps = {
  children?: ReactNode
}

/**
 * MainLayout
 */
function MainLayout(props: LayoutProps) {
  const { children } = props
  const settings = useLayoutSettings()
  const { data: currentSettings } = useSettings()
  const config = settings.config as LayoutConfigDefaultsType
  const showNavebar = config?.navbar?.display !== false
  const showSidebar = config?.leftSidePanel?.display !== false
  const pageMeta = currentSettings?.page

  const sidebar_state = useMemo(
    () =>
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("sidebar_state="))
        ?.split("=")[1] === "true",
    []
  )

  return (
    <>
      <Helmet>
        <title>
          {pageMeta?.title ? `${pageMeta.title} | App` : "App"}
        </title>
        {pageMeta?.description && (
          <meta name="description" content={pageMeta.description} />
        )}
        {pageMeta?.keywords && (
          <meta name="keywords" content={pageMeta.keywords} />
        )}
      </Helmet>
      <SidebarProvider defaultOpen={sidebar_state ?? false}>
        {showSidebar && <AppSidebar />}
        <SidebarInset>
          {showNavebar && <AppHeader showSidebar={showSidebar} />}
          <div
            id="main-scroll"
            className="@container/main h-[calc(100svh-48px)] overflow-y-auto bg-background [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {children}
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}

export default memo(MainLayout)
