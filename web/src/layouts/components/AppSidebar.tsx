import { useLocation } from "react-router"
import {
  GalleryVerticalEnd,
  LayoutDashboard,
  FileSearchCorner,
  FolderTree,
  User,
  type LucideIcon,
  ChartPie,
  Megaphone,
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
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", url: "/analytics", icon: ChartPie },
    ],
  },
  {
    label: "Management",
    items: [
      {
        title: "Content",
        url: "#",
        icon: FileSearchCorner,
        perm: "posts.edit_own",
        defaultOpen: true,
        items: [
          { title: "Posts", url: "/posts", perm: "posts.edit_any" },
          {
            title: "Categories",
            url: "/categories",
            icon: FolderTree,
            perm: "categories.manage",
          },
          { title: "Tags", url: "/tags", perm: "categories.manage" },
        ],
      },
      {
        title: "Media",
        url: "/media",
        icon: GalleryVerticalEnd,
        perm: "media.manage",
      },
      {
        title: "Users",
        url: "/users",
        icon: User,
        perm: "users.manage",
      },
            {
        title: "Marketing",
        url: "/marketing",
        icon: Megaphone,
        perm: "users.manage",
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
