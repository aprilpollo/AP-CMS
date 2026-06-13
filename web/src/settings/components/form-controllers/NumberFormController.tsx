import { type Control } from "react-hook-form";
import { type SettingsConfigType } from "../../context/SettingsContext";
import { debounce } from "lodash";
import { Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { Input } from "@/components/ui/input";

type NumberFormControllerProps = {
  name: keyof SettingsConfigType;
  control: Control<SettingsConfigType>;
  item: {
    title: string;
    min?: number;
    max?: number;
  };
};

function NumberFormController(props: NumberFormControllerProps) {
  const { name, control, item } = props;

  return (
    <div key={name} className="Settings-formControl">
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => {
          const numValue =
            typeof value === "number"
              ? value
              : typeof value === "string"
              ? Number(value) || 0
              : 0;
          return (
            <NumberTextField value={numValue} onChange={onChange} item={item} />
          );
        }}
      />
    </div>
  );
}

type NumberTextFieldProps = {
  value: number;
  onChange: (value: number) => void;
  item: NumberFormControllerProps["item"];
};

function NumberTextField(props: NumberTextFieldProps) {
  const { value, onChange, item } = props;
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState("");

  const debouncedOnChange = useRef(
    debounce((newValue: number) => {
      onChange(newValue);
    }, 500)
  ).current;

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = +ev.target.value;

    if (item?.min && newValue < item?.min) {
      setError(`Value is too low (min: ${item?.min})`);
      setLocalValue(newValue);
      return;
    }

    if (item?.max && newValue > item?.max) {
      setError(`Value is too high (max: ${item?.max})`);
      setLocalValue(newValue);
      return;
    }

    setError("");
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="space-y-1">
      <Input
        value={localValue}
        onChange={handleChange}
        type="number"
        min={item.min}
        max={item.max}
        className={error ? "border-red-500" : ""}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}

export default NumberFormController;
