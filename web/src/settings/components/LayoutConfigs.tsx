import { type Control } from "react-hook-form";
import LayoutConfig from "./LayoutConfig";
import type ThemeFormConfigTypes from "../types/ThemeFormConfigTypes";
import { type SettingsConfigType } from "../context/SettingsContext";

type SettingsControllersProps = {
  value: ThemeFormConfigTypes;
  prefix: string;
  control: Control<SettingsConfigType>;
};

function LayoutConfigs(props: SettingsControllersProps) {
  const { value, prefix, control } = props;

  return Object?.entries?.(value)?.map?.(([key, item]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    return (
      <LayoutConfig
        key={key}
        name={name as keyof SettingsConfigType}
        control={control}
        item={item}
      />
    );
  });
}

export default LayoutConfigs;
