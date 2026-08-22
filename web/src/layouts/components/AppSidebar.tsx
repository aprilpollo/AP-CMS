import { useLocation } from "react-router"
import {
  type LucideIcon,
  GalleryVerticalEnd,
  LayoutDashboard,
  ShieldKeyhole,
  ChartPie,
  Megaphone,
  UsersRound,
  StickyNote,
  Tag,
  Layers2,
  Unplug,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "./TeamSwitcher"
import { DropdownMenuSidebar } from "./DropdownSidebar"
import { NavMenu } from "./NavMenu"
import useUser from "@/auth/hooks/useUser"

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  /** permission slug required to see this item; omitted = always visible */
  perm?: string
  defaultOpen?: boolean
  items?: {
    title: string
    url: string
    icon?: LucideIcon
    perm?: string
  }[]
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "General",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", url: "/analytics", icon: ChartPie },
      { title: "Posts", url: "/posts", icon: StickyNote },
      { title: "Categories", url: "/categories", icon: Layers2 },
      { title: "Tags", url: "/tags", icon: Tag },
      { title: "Media", url: "/media", icon: GalleryVerticalEnd },
      { title: "Marketing", url: "/marketing", icon: Megaphone },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Users & Roles",
        url: "#",
        icon: UsersRound,
        items: [
          { title: "Users", url: "/users" },
          { title: "Roles & Permissions", url: "/roles" },
        ],
      },
      {
        title: "Security",
        url: "/security",
        icon: ShieldKeyhole,
      },
      {
        title: "Connections",
        url: "/connections",
        icon: Unplug,
      },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { data: user } = useUser()
  const permissions = user?.permissions ?? []

  const can = (perm?: string) => !perm || permissions.includes(perm)
  const isActive = (href: string) =>
    `/${location.pathname.split("/")[1]}` === href

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <TeamSwitcher
          teams={[
            {
              name: "Pollo CMS",
              logo: GalleryVerticalEnd,
              plan: "Admin",
            },
          ]}
        />
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => {
          const items = group.items
            .filter((item) => can(item.perm))
            .map((item) => ({ ...item, isActive: isActive(item.url) }))

          if (items.length === 0) return null

          return <NavMenu key={group.label} label={group.label} items={items} />
        })}
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenuSidebar />
      </SidebarFooter>
    </Sidebar>
  )
}
