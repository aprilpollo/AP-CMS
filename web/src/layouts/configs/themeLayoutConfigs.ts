import type ThemeFormConfigTypes from "@/settings/types/ThemeFormConfigTypes";
import layout, { type LayoutConfigDefaultsType } from "./LayoutConfig";

/**
 * The type definition for the theme layout defaults.
 */
export type themeLayoutDefaultsProps = LayoutConfigDefaultsType;

/**
 * The type definition for the theme layout.
 */
export type themeLayoutProps = {
  title: string;
  defaults: themeLayoutDefaultsProps;
  form?: ThemeFormConfigTypes;
};

/**
 * The type definition for the theme layout configs.
 */
export type themeLayoutConfigsProps = Record<string, themeLayoutProps>;

/**
 * The theme layout configs.
 */
const themeLayoutConfigs: themeLayoutConfigsProps = {
  layout: layout as themeLayoutProps,
};

export default themeLayoutConfigs;
