/**
 * Theme Hooks for CSS-based dark mode
 *
 * Uses CSS classes on the root HTML element for theming.
 * Compatible with Tailwind's dark: variant classes.
 */

import { useCallback, useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark" | "system";

/**
 * Subscribe to theme changes on document element
 */
const subscribe = (callback: () => void) => {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
};

/**
 * Get current theme mode from document classes
 */
const getSnapshot = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

const getServerSnapshot = (): "light" | "dark" => "light";

/**
 * Hook to get current resolved theme (dark or light)
 */
export const useResolvedTheme = (): "dark" | "light" => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

/**
 * Hook to check if dark mode is currently active
 */
export const useIsDarkMode = (): boolean => {
  const theme = useResolvedTheme();
  return theme === "dark";
};

/**
 * Hook to toggle theme mode
 */
export const useThemeToggle = () => {
  const currentTheme = useResolvedTheme();

  const toggle = useCallback(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(currentTheme === "dark" ? "light" : "dark");
  }, [currentTheme]);

  const setTheme = useCallback((mode: "light" | "dark") => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(mode);
  }, []);

  return { theme: currentTheme, toggle, setTheme };
};

/**
 * Hook to get main theme configuration (for backward compatibility)
 */
export const useMainTheme = () => {
  const theme = useResolvedTheme();
  return {
    mode: theme,
    direction: (typeof document !== "undefined"
      ? document.documentElement.dir
      : "ltr") as "ltr" | "rtl",
  };
};
