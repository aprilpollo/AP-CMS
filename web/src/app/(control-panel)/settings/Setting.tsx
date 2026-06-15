import { Outlet, useLocation } from "react-router"
import { User, Lock, type LucideIcon, Bell, Palette, Users, Workflow } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "@/shared/Link"

type SettingItem = {
  page: string
  label: string
  icon?: LucideIcon
}

export default function Setting() {
  const { pathname } = useLocation()
  const settingsPages: SettingItem[] = [
    { page: "/account", label: "Account", icon: User },
    { page: "/security", label: "Security", icon: Lock },
    { page: "/notifications", label: "Notifications", icon: Bell },
    { page: "/appearance", label: "Appearance", icon:  Palette},
    { page: "/team", label: "Team", icon: Users },
    { page: "/integrations", label: "Integrations", icon: Workflow },
  ]
  return (
    <main className="container mx-auto max-w-7xl px-2">
      <header className="border-b p-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Site configuration.</p>
      </header>
      <div className="grid grid-cols-5 gap-1 py-4">
        <div className="col-span-1 border-r">
          <nav className="flex flex-col pr-1">
            <ul>
              {settingsPages.map((item) => (
                <li key={item.page}>
                  <Link to={`./${item.page}`}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname.endsWith(item.page) &&
                          "bg-accent text-accent-foreground"
                      )}
                    >
                      {item.icon && <item.icon />}
                      {item.label}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="col-span-4">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
