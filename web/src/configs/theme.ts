import { type ThemesType } from "@/settings/context/SettingsContext";

/**
 * Simplified themes config - uses CSS variables from index.css
 * Only mode (light/dark) matters, colors are handled by CSS variables
 */
export const themesConfig: ThemesType = {
  default: {
    palette: {
      mode: "light",
    },
  },
  defaultDark: {
    palette: {
      mode: "dark",
    },
  },
};

export default themesConfig;
