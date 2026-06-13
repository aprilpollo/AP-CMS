import themesConfig from "@/configs/theme";
import authRoles from "@/auth/roles";
import { type SettingsConfigType } from "@/settings/context/SettingsContext";

// import i18n from '@i18n/i18n';

/**
 * The settingsConfig object is a configuration object for the application's settings.
 */
const settingsConfig: SettingsConfigType = {
  /**
   * The layout object defines the layout style and configuration for the application.
   */
  layout: {
    /**
     * The style property defines the layout style for the application.
     */
    style: "layout", // Layout layout2 layout3
    /**
     * The config property defines the layout configuration for the application.
     * Check out default layout configs at src/components/layouts for example src/components/layouts/Layout/LayoutConfig.js
     */
    config: {
      navbar: {
        style: "style-2",
      },
    }, // checkout default layout configs at src/components/layouts for example  src/components/layouts/Layout/LayoutConfig.js
  },

  /**
   * The customScrollbars property defines whether or not to use custom scrollbars in the application.
   */
  customScrollbars: true,

  /**
   * The direction property defines the text direction for the application.
   */
  //direction: i18n.dir(i18n.options.lng) || 'ltr', // rtl, ltr
  direction: "ltr", // rtl, ltr
  /**
   * The theme object defines the color theme for the application.
   */
  theme: {
    main: themesConfig.default,
    navbar: themesConfig.defaultDark,
    toolbar: themesConfig.default,
    footer: themesConfig.defaultDark,
  },

  /**
   * The defaultAuth property defines the default authorization roles for the application.
   * To make the whole app auth protected by default set defaultAuth:['admin','staff','user']
   * To make the whole app accessible without authorization by default set defaultAuth: null
   * The individual route configs which have auth option won't be overridden.
   */
  defaultAuth: authRoles.user,

  /**
   * The loginRedirectUrl property defines the default redirect URL for the logged-in user.
   */
  loginRedirectUrl: "/",
};

export default settingsConfig;
