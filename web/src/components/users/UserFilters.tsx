import type { ReactNode } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListRolesQuery } from "@/store/api/cmsApi"
import {
  NO_FILTERS,
  activeFilterCount,
  type UserFilters,
} from "@/components/users/filters"

/** Sentinel for "no constraint" — Radix Select forbids an empty item value. */
const ANY = "any"

function FilterField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function UserFilterMenu({
  value,
  onChange,
}: {
  value: UserFilters
  onChange: (filters: UserFilters) => void
}) {
  const { data: roles = [] } = useListRolesQuery()
  const count = activeFilterCount(value)

  const set = <K extends keyof UserFilters>(key: K, next: UserFilters[K]) =>
    onChange({ ...value, [key]: next })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="rounded-sm">
          <SlidersHorizontal />
          Add Filter
          {count > 0 && (
            <Badge variant="secondary" className="rounded-sm px-1.5">
              {count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Filters</span>
          {count > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 rounded-sm px-1.5 text-xs text-muted-foreground"
              onClick={() => onChange(NO_FILTERS)}
            >
              Clear all
            </Button>
          )}
        </div>

        <FilterField label="Role">
          <Select
            value={value.roleId === undefined ? ANY : String(value.roleId)}
            onValueChange={(next) =>
              set("roleId", next === ANY ? undefined : Number(next))
            }
          >
            <SelectTrigger size="sm" className="w-full rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ANY}>Any role</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Status">
          <Select
            value={value.isActive === undefined ? ANY : String(value.isActive)}
            onValueChange={(next) =>
              set("isActive", next === ANY ? undefined : next === "true")
            }
          >
            <SelectTrigger size="sm" className="w-full rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ANY}>Any status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Last login">
          <Select
            value={value.lastLogin ?? ANY}
            onValueChange={(next) =>
              set(
                "lastLogin",
                next === ANY ? undefined : (next as UserFilters["lastLogin"])
              )
            }
          >
            <SelectTrigger size="sm" className="w-full rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ANY}>Anytime</SelectItem>
                <SelectItem value="signed-in">Has signed in</SelectItem>
                <SelectItem value="never">Never signed in</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Joined between">
          <div className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-1.5">
            <Input
              type="date"
              aria-label="Joined from"
              max={value.joinedTo}
              value={value.joinedFrom ?? ""}
              onChange={(e) => set("joinedFrom", e.target.value || undefined)}
              className="h-7 min-w-0 flex-1 rounded-sm px-1.5 text-xs"
            />
            <span className="text-xs text-muted-foreground">–</span>
            <Input
              type="date"
              aria-label="Joined to"
              min={value.joinedFrom}
              value={value.joinedTo ?? ""}
              onChange={(e) => set("joinedTo", e.target.value || undefined)}
              className="h-7 min-w-0 flex-1 rounded-sm px-1.5 text-xs"
            />
          </div>
        </FilterField>
      </PopoverContent>
    </Popover>
  )
}

export function UserFilterChips({
  value,
  onChange,
}: {
  value: UserFilters
  onChange: (filters: UserFilters) => void
}) {
  const { data: roles = [] } = useListRolesQuery()
  const clear = (key: keyof UserFilters) =>
    onChange({ ...value, [key]: undefined })

  const chips: { key: keyof UserFilters; label: string }[] = []

  if (value.roleId !== undefined) {
    const role = roles.find((item) => item.id === value.roleId)
    chips.push({ key: "roleId", label: `Role: ${role?.name ?? value.roleId}` })
  }
  if (value.isActive !== undefined) {
    chips.push({
      key: "isActive",
      label: value.isActive ? "Status: Active" : "Status: Inactive",
    })
  }
  if (value.lastLogin !== undefined) {
    chips.push({
      key: "lastLogin",
      label:
        value.lastLogin === "never"
          ? "Never signed in"
          : "Has signed in",
    })
  }
  if (value.joinedFrom !== undefined) {
    chips.push({ key: "joinedFrom", label: `Joined from ${value.joinedFrom}` })
  }
  if (value.joinedTo !== undefined) {
    chips.push({ key: "joinedTo", label: `Joined to ${value.joinedTo}` })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-2">
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="gap-1 rounded-sm pr-1 font-normal"
        >
          {chip.label}
          <button
            type="button"
            aria-label={`Remove filter ${chip.label}`}
            onClick={() => clear(chip.key)}
            className="cursor-pointer rounded-xs text-muted-foreground hover:text-foreground"
          >
            <X />
          </button>
        </Badge>
      ))}
      <Button
        size="sm"
        variant="ghost"
        className="h-5 rounded-sm px-1.5 text-xs text-muted-foreground"
        onClick={() => onChange(NO_FILTERS)}
      >
        Clear all
      </Button>
    </div>
  )
}
