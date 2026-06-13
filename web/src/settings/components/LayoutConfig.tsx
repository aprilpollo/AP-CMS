import { type Control } from "react-hook-form";
import { type AnyFormFieldType } from "@/settings/types/ThemeFormConfigTypes";
import { type SettingsConfigType } from "../context/SettingsContext";
import LayoutConfigs from "./LayoutConfigs";
import RadioFormController from "./form-controllers/RadioFormController";
import SwitchFormController from "./form-controllers/SwitchFormController";
import NumberFormController from "./form-controllers/NumberFormController";

type SettingsControllerProps = {
  key?: string;
  name: keyof SettingsConfigType;
  control: Control<SettingsConfigType>;
  title?: string;
  item: AnyFormFieldType;
};

function LayoutConfig(props: SettingsControllerProps) {
  const { item, name, control } = props;

  switch (item.type) {
    case "radio":
      return <RadioFormController name={name} control={control} item={item} />;
    case "switch":
      return <SwitchFormController name={name} control={control} item={item} />;
    case "number":
      return <NumberFormController name={name} control={control} item={item} />;
    case "group":
      return (
        <div key={name} >
          <span className="text-muted-foreground">
            {item.title}
          </span>
          <LayoutConfigs
            value={item.children}
            prefix={name}
            control={control}
          />
        </div>
      );
    default:
      return "";
  }
}

export default LayoutConfig;
