import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export type CheckboxTreeOption = {
  value: string
  label: string
  children?: CheckboxTreeOption[]
}

interface CheckboxTreeProps {
  options: CheckboxTreeOption[]
  value?: CheckboxTreeOption[]
  onChange?: (value: CheckboxTreeOption[]) => void
  className?: string
}

/** Returns the chain of ancestor options leading to `targetValue`, or null if not found. */
function findAncestors(
  options: CheckboxTreeOption[],
  targetValue: string,
  chain: CheckboxTreeOption[] = []
): CheckboxTreeOption[] | null {
  for (const option of options) {
    if (option.value === targetValue) return chain
    if (option.children) {
      const found = findAncestors(option.children, targetValue, [
        ...chain,
        option,
      ])
      if (found) return found
    }
  }
  return null
}

/** Returns every nested descendant value of `option` (children, grandchildren, ...). */
function collectDescendantValues(option: CheckboxTreeOption): string[] {
  if (!option.children) return []
  return option.children.flatMap((child) => [
    child.value,
    ...collectDescendantValues(child),
  ])
}

export function CheckboxTree({
  options,
  value = [],
  onChange,
  className,
}: CheckboxTreeProps) {
  const selectedValues = new Set(value.map((o) => o.value))

  function toggle(option: CheckboxTreeOption) {
    if (selectedValues.has(option.value)) {
      const toRemove = new Set([
        option.value,
        ...collectDescendantValues(option),
      ])
      onChange?.(value.filter((o) => !toRemove.has(o.value)))
    } else {
      const ancestors = findAncestors(options, option.value) ?? []
      const toAdd = [option, ...ancestors].filter(
        (o) => !selectedValues.has(o.value)
      )
      onChange?.([...value, ...toAdd])
    }
  }

  function renderOptions(opts: CheckboxTreeOption[], depth = 0) {
    return opts.map((option) => (
      <div key={option.value}>
        <Label
          className="flex items-center gap-2 py-1 font-normal"
          style={{ paddingLeft: depth * 20 }}
        >
          <Checkbox
            checked={selectedValues.has(option.value)}
            onCheckedChange={() => toggle(option)}
          />
          {option.label}
        </Label>
        {option.children && renderOptions(option.children, depth + 1)}
      </div>
    ))
  }

  return (
    <ScrollArea className={cn("h-48 rounded-md border p-2", className)}>
      {renderOptions(options)}
    </ScrollArea>
  )
}
