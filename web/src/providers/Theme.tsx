import { memo, type ReactNode, useEffect, useLayoutEffect } from "react";

/**
 * The useEnhancedEffect function is used to conditionally use the useLayoutEffect hook if the window object is defined.
 * Otherwise, it uses the useEffect hook.
 */
const useEnhancedEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export type ThemeMode = "light" | "dark";
export type ThemeDirection = "ltr" | "rtl";

export type ThemeConfig = {
  mode: ThemeMode;
  direction: ThemeDirection;
};

type ThemeProps = {
  children: ReactNode;
  theme?: ThemeConfig;
  root?: boolean;
};

/**
 * CSS-based Theme component
 *
 * This component manages the theme by adding/removing CSS classes on the document.
 * It works with Tailwind's dark mode classes (dark: variant).
 *
 * Global styles are handled via globals.css with CSS custom properties.
 */
function Theme(props: ThemeProps) {
  const { theme, children, root = false } = props;
  const mode = theme?.mode ?? "light";
  const langDirection = theme?.direction ?? "ltr";

  // Set document direction
  useEnhancedEffect(() => {
    if (root) {
      document.documentElement.dir = langDirection;
    }
  }, [langDirection, root]);

  // Set theme mode class on document
  useEffect(() => {
    if (root) {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(mode);
    }
  }, [mode, root]);

  return <>{children}</>;
}

export default memo(Theme);
