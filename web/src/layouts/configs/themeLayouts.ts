import React, { type ComponentType } from "react";
import MainLayout from "../MainLayout";

/**
 * The type definition for the theme layouts.
 */
export type themeLayoutsType = Record<
  string,
  ComponentType<{ children?: React.ReactNode }>
>;

/**
 * The theme layouts.
 */
const themeLayouts: themeLayoutsType = {
  layout: MainLayout,
};

export default themeLayouts;
