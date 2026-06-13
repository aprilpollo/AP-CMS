import { type Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { type SettingsConfigType } from "../../context/SettingsContext";

type RadioFormControllerProps = {
  name: keyof SettingsConfigType;
  control: Control<SettingsConfigType>;
  item: {
    title: string;
    options: { value: string; name: string }[];
  };
};

function RadioFormController(props: RadioFormControllerProps) {
  const { name, control, item } = props;

  return (
    <Controller
      key={name}
      name={name}
      control={control}
      render={({ field }) => {
        const stringValue = typeof field.value === "string" ? field.value : "";
        return (
          <div className="space-y-3">
            <Label className="text-base font-medium">{item.title}</Label>
            <RadioGroup
              value={stringValue}
              onValueChange={field.onChange}
              className={
                item?.options?.length < 4
                  ? "flex flex-row gap-4"
                  : "flex flex-col gap-2"
              }
            >
              {item?.options?.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={opt.value}
                    id={`${name}-${opt.value}`}
                  />
                  <Label
                    htmlFor={`${name}-${opt.value}`}
                    className="font-normal cursor-pointer"
                  >
                    {opt.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      }}
    />
  );
}

export default RadioFormController;
