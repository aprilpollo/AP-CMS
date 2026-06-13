import React, { useEffect, useMemo } from "react";
import { type SettingsConfigType } from "@/settings/context/SettingsContext";
import { type themeLayoutsType } from "@/layouts/configs/themeLayouts";
import usePathname from "@/hooks/usePathname";
import useSettings from "@/settings/hooks/useSettings";
import LayoutSettingsContext from "./context/LayoutSettingsContext";

export type RouteObjectType = {
  settings?: SettingsConfigType;
  auth?: string[] | [] | null | undefined;
};

export type LayoutProps = {
  layouts: themeLayoutsType;
  children?: React.ReactNode;
};

/**
 * Layout
 * React frontend component in a React project that is used for layouting the user interface. The component
 * handles generating user interface settings related to current routes, merged with default settings, and uses
 * the new settings to generate layouts.
 */
function Layout(props: LayoutProps) {
  const { layouts, children } = props;

  const { data: current } = useSettings();
  const layoutSetting = useMemo(() => current.layout, [current]);
  const layoutStyle = useMemo(() => layoutSetting.style, [layoutSetting]);
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <LayoutSettingsContext value={layoutSetting}>
      {useMemo(() => {
        return Object.entries(layouts).map(([key, Layout]) => {
          if (key === layoutStyle) {
            return (
              <React.Fragment key={key}>
                <Layout>{children}</Layout>
              </React.Fragment>
            );
          }

          return null;
        });
      }, [layoutStyle, layouts, children])}
    </LayoutSettingsContext>
  );
}

export default Layout;
