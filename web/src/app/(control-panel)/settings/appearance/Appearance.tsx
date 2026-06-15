import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

type ThemeOption = {
  value: "light" | "dark" | "system"
  label: string
  icon: LucideIcon
}

const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export default function Appearance() {
  const { theme, setTheme } = useTheme()

  return (
    <main className="pl-1">
      <header className="border-b p-4">
        <h1 className="text-2xl">Appearance</h1>
        <p className="text-sm text-muted-foreground">
          Customize how the interface looks.
        </p>
      </header>
      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Theme</p>
          <p className="text-xs text-muted-foreground">
            Select the theme for the dashboard.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-accent",
                theme === option.value
                  ? "border-primary ring-2 ring-primary"
                  : "border-border"
              )}
            >
              <option.icon className="size-5" />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
