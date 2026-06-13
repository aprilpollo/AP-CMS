import type { PartialDeep } from 'type-fest';
import { createContext } from 'react';
import { type themeLayoutDefaultsProps } from '@/layouts/configs/themeLayoutConfigs';

/**
 * Custom Palette type
 */
export type PaletteType = {
  mode?: "light" | "dark";
  primary?: {
    main?: string;
    light?: string;
    dark?: string;
    contrastText?: string;
  };
  secondary?: {
    main?: string;
    light?: string;
    dark?: string;
    contrastText?: string;
  };
  background?: { default?: string; paper?: string };
  text?: { primary?: string; secondary?: string; disabled?: string };
  error?: {
    main?: string;
    light?: string;
    dark?: string;
    contrastText?: string;
  };
  divider?: string;
};

export type ThemeType = { palette: PaletteType };
export type ThemesType = Record<string, ThemeType>;

export type PageMetaType = {
  title?: string;
  description?: string;
  keywords?: string;
};

export type SettingsConfigType = {
  layout: { style?: string; config?: PartialDeep<themeLayoutDefaultsProps> };
  page?: PageMetaType;
  customScrollbars?: boolean;
  direction: "rtl" | "ltr";
  theme: {
    main: ThemeType;
    navbar: ThemeType;
    toolbar: ThemeType;
    footer: ThemeType;
  };
  defaultAuth?: string[];
  loginRedirectUrl: string;
};

export type SettingsProviderState = {
	userSettings?: PartialDeep<SettingsConfigType>;
	data: SettingsConfigType;
	defaults: SettingsConfigType;
	initial: SettingsConfigType;
};

// SettingsContext type
export type SettingsContextType = SettingsProviderState & {
	setSettings: (newSettings: Partial<SettingsConfigType>) => SettingsConfigType;
};

// Context with a default value of undefined
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export default SettingsContext;
