import { type Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { type SettingsConfigType } from "../../context/SettingsContext";

type SwitchFormControllerProps = {
  name: keyof SettingsConfigType;
  control: Control<SettingsConfigType>;
  item: {
    title: string;
  };
};

function SwitchFormController(props: SwitchFormControllerProps) {
  const { name, control, item } = props;

  return (
    <Controller
      key={name}
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <div className="flex items-center justify-between space-x-4">
          <Label htmlFor={name} className="text-base font-medium">
            {item.title}
          </Label>
          <Switch
            id={name}
            checked={!!value}
            onCheckedChange={onChange}
            aria-label={item.title}
          />
        </div>
      )}
    />
  );
}

export default SwitchFormController;
