import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
} from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

export type Option = {
  value: string
  label: string
  children?: Option[]
}

interface ComboboxMultipleProps {
  title?: string
  description?: string
  options?: Option[]
  value?: Option[]
  onChange?: (value: Option[]) => void
  ButtonProps?: React.ComponentProps<typeof Button>
}

export function MultipleCheckbox({
  title,
  description,
  options = [],
  value = [],
  onChange,
  ButtonProps
}: ComboboxMultipleProps ) {
  const selectedValues = new Set(value.map((o) => o.value))

  function toggle(option: Option) {
    if (selectedValues.has(option.value)) {
      onChange?.(value.filter((o) => o.value !== option.value))
    } else {
      onChange?.([...value, option])
    }
  }

  const label =
    value.length === 0
      ? (title ?? "Select")
      : `${title ?? "Selected"} (${value.length})`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button {...ButtonProps} >
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="px-0 ">
        <PopoverHeader className="px-2">
          <PopoverTitle>{title}</PopoverTitle>
          <PopoverDescription>{description}</PopoverDescription>
        </PopoverHeader>
        <ScrollArea className="px-2">
          <FieldGroup className="gap-2 max-h-80 my-2">
            {options.map((option) => (
              <div key={option.value}>
                <Field orientation="horizontal">
                  <Checkbox
                    checked={selectedValues.has(option.value)}
                    onCheckedChange={() => toggle(option)}
                  />
                  <Label>{option.label}</Label>
                </Field>
                {option.children && (
                  <div className="mt-2 ml-6 space-y-2">
                    {option.children.map((child) => (
                      <Field key={child.value} orientation="horizontal">
                        <Checkbox
                          checked={selectedValues.has(child.value)}
                          onCheckedChange={() => toggle(child)}
                        />
                        <Label>{child.label}</Label>
                      </Field>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </FieldGroup>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
