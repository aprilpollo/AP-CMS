import { Controller, useForm } from "react-hook-form";
import themeLayoutConfigs from "@/layouts/configs/themeLayoutConfigs";
import _ from "lodash";
import { memo, useEffect, useMemo } from "react";
import LayoutConfigs from "./LayoutConfigs";
import usePrevious from "@/hooks/usePrevious";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { type SettingsConfigType } from "../context/SettingsContext";

/**
 * Custom Palette type (replacing MUI Palette)
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

type SettingsProps = {
  value: SettingsConfigType;
  onChange: (settings: SettingsConfigType) => void;
};

/**
 * The Settings component is responsible for rendering the settings form.
 * Theme colors are now managed via CSS variables in index.css.
 */
function Settings(props: SettingsProps) {
  const { onChange, value: settings } = props;
  const { reset, watch, control } = useForm({
    mode: "onChange",
    defaultValues: settings,
  });

  const form = watch();
  const formLayoutStyle = watch("layout.style") || "layout";

  const layoutFormConfigs = useMemo(
    () =>
      formLayoutStyle ? themeLayoutConfigs[formLayoutStyle]?.form : undefined,
    [formLayoutStyle]
  );

  const prevForm = usePrevious(form ? _.merge({}, form) : null);
  const prevSettings = usePrevious(settings ? _.merge({}, settings) : null);

  const formChanged = useMemo(
    () => !_.isEqual(form, prevForm),
    [form, prevForm]
  );
  const settingsChanged = useMemo(
    () => !_.isEqual(settings, prevSettings),
    [settings, prevSettings]
  );

  useEffect(() => {
    // reset form if settings change and not same with form
    if (!_.isEqual(settings, form)) {
      reset(settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  useEffect(() => {
    // Skip initial changes
    if (!prevForm && !prevSettings) {
      return;
    }

    const newSettings = _.merge({}, settings, form);

    // No need to change
    if (_.isEqual(newSettings, settings)) {
      return;
    }

    // If form changed update theme settings
    if (formChanged) {
      if (settings.layout.style !== newSettings.layout.style) {
        const newStyle = newSettings?.layout?.style;
        if (newStyle) {
          _.set(
            newSettings,
            "layout.config",
            themeLayoutConfigs[newStyle]?.defaults
          );
        }
      }

      onChange(newSettings);
    }
  }, [
    form,
    onChange,
    formChanged,
    prevForm,
    prevSettings,
    reset,
    settings,
    settingsChanged,
  ]);

  return (
    <div className="space-y-6">
      {/* Layout Section */}
      <div className="relative border rounded-sm p-3 pt-4 mt-4">
        <span className="absolute -top-2.5 left-2 bg-background px-1 font-semibold text-sm text-muted-foreground">
          Layout
        </span>

        <Controller
          name="layout.style"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label className="text-base">Style</Label>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="space-y-1"
              >
                {Object.entries(themeLayoutConfigs).map(([key, layout]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`layout-${key}`} />
                    <Label htmlFor={`layout-${key}`} className="font-normal">
                      {layout.title}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        />

        {layoutFormConfigs &&
          useMemo(
            () => (
              <LayoutConfigs
                value={layoutFormConfigs}
                prefix="layout.config"
                control={control}
              />
            ),
            [layoutFormConfigs, control]
          )}

        <p className="my-4 text-sm italic text-muted-foreground">
          *Not all option combinations are available
        </p>
      </div>

      {/* Theme Info Section */}
      <div className="relative border rounded-sm p-3 pb-4 pt-4">
        <span className="absolute -top-2.5 left-2 bg-background px-1 font-semibold text-sm text-muted-foreground">
          Theme
        </span>
        <p className="text-sm text-muted-foreground">
          Theme colors are managed via CSS variables. Use the theme toggle in
          the header to switch between light and dark modes.
        </p>
      </div>

      {/* Custom Scrollbars */}
      <Controller
        name="customScrollbars"
        control={control}
        render={({ field: { onChange, value } }) => (
          <div className="flex items-center justify-between space-x-4">
            <Label htmlFor="custom-scrollbars" className="text-base">
              Custom Scrollbars
            </Label>
            <Switch
              id="custom-scrollbars"
              checked={value}
              onCheckedChange={onChange}
            />
          </div>
        )}
      />

      {/* Direction */}
      <Controller
        name="direction"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label className="text-base">Direction</Label>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rtl" id="direction-rtl" />
                <Label htmlFor="direction-rtl" className="font-normal">
                  RTL
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ltr" id="direction-ltr" />
                <Label htmlFor="direction-ltr" className="font-normal">
                  LTR
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
      />
    </div>
  );
}

export default memo(Settings);
