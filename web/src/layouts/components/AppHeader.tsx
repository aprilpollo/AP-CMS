import { useLocation } from "react-router"
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ThemeToggle from "@/shared/ThemeToggle"
import useUser from "@/auth/hooks/useUser"
import Link from "@/shared/Link"


// Map pathname → readable label
const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/board": "Board",
  "/list": "List",
  "/inbox": "Inbox",
  "/my-work": "My Work",
  "/members": "Members",
  "/settings": "Settings",
}

function useBreadcrumb() {
  const { pathname } = useLocation()
  // match exact, then try prefix
  const label =
    PAGE_LABELS[pathname] ??
    Object.entries(PAGE_LABELS).find(([key]) =>
      pathname.startsWith(key + "/")
    )?.[1] ??
    "Page"
  return label
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return "U"
}

export function AppHeader({ showSidebar = true }: { showSidebar?: boolean }) {
  const pageLabel = useBreadcrumb()
  const { data: user, signOut } = useUser()
  const fallbackName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()
  const displayName = user?.display_name || fallbackName || "user"
  const email = user?.email ?? ""
  const initials = getInitials(user?.display_name, user?.email)

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 bg-background px-3">
      <div className="flex items-center gap-2">
        {showSidebar && <SidebarTrigger className="-ml-1 cursor-pointer" />}
        {showSidebar && <div className="h-4 border-x" />}
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/" className="text-muted-foreground">
            Home
          </Link>
          <ChevronRight className="size-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">{pageLabel}</span>
        </nav>
      </div>

      <div className="mx-4 flex flex-1 items-center justify-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks, projects… ⌘K"
            className="h-8 bg-muted/40 pl-8 text-sm focus-visible:bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 cursor-pointer"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 flex size-2 items-center justify-center rounded-full bg-blue-500" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        <div className="h-4 border-x" />

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 cursor-pointer gap-2 px-2">
              <Avatar className="size-6">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">
                <User className="mr-2 size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">
                <Settings className="mr-2 size-4" />
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={signOut}
              className="cursor-pointer text-red-500"
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
