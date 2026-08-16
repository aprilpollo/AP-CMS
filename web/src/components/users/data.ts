export type UserStatus = "Active" | "Inactive" | "Pending"

export type UserItem = {
  id: string
  firstName: string
  lastName: string
  displayName: string
  avatar: string
  email: string
  role: string
  status: UserStatus
  bio: string
  joinDate: string
  lastActive: string
  posts: number
  comments: number
}

export const userRoles = ["Admin", "Editor", "Author", "Subscriber"]

export const userStatuses: UserStatus[] = ["Active", "Inactive", "Pending"]

export const users: UserItem[] = [
  {
    id: "1",
    firstName: "Alex",
    lastName: "Thompson",
    displayName: "Alex Thompson",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    email: "alex.t@company.com",
    role: "Admin",
    status: "Active",
    bio: "Platform administrator. Takes care of access control and site configuration.",
    joinDate: "2023-01-15",
    lastActive: "2026-08-15 09:24",
    posts: 42,
    comments: 128,
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Chen",
    displayName: "Sarah Chen",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    email: "sarah.c@company.com",
    role: "Editor",
    status: "Active",
    bio: "Content editor focused on the product blog and release notes.",
    joinDate: "2023-04-02",
    lastActive: "2026-08-14 17:05",
    posts: 87,
    comments: 63,
  },
  {
    id: "3",
    firstName: "James",
    lastName: "Wilson",
    displayName: "James Wilson",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    email: "james.w@company.com",
    role: "Author",
    status: "Inactive",
    bio: "Writes long-form tutorials. Currently on leave.",
    joinDate: "2023-08-21",
    lastActive: "2026-05-30 11:47",
    posts: 19,
    comments: 12,
  },
  {
    id: "4",
    firstName: "Maria",
    lastName: "Garcia",
    displayName: "Maria Garcia",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    email: "maria.g@company.com",
    role: "Subscriber",
    status: "Pending",
    bio: "Invited to review upcoming documentation.",
    joinDate: "2024-02-10",
    lastActive: "-",
    posts: 0,
    comments: 4,
  },
]

export function getUserById(id?: string) {
  return users.find((user) => user.id === id)
}

export type NewUserInput = {
  firstName: string
  lastName: string
  displayName: string
  email: string
  role: string
  status: UserStatus
  bio: string
  avatar?: string
}

export function addUser(input: NewUserInput): UserItem {
  const nextId = String(
    users.reduce((max, user) => Math.max(max, Number(user.id) || 0), 0) + 1
  )
  const user: UserItem = {
    ...input,
    id: nextId,
    avatar: input.avatar ?? "",
    joinDate: new Date().toISOString().slice(0, 10),
    lastActive: "-",
    posts: 0,
    comments: 0,
  }
  users.push(user)
  return user
}

export type UserSession = {
  id: string
  device: string
  location: string
  lastSeen: string
  current: boolean
}

export const userSessions: UserSession[] = [
  {
    id: "s1",
    device: "Chrome on macOS",
    location: "Bangkok, TH",
    lastSeen: "2026-08-15 09:24",
    current: true,
  },
  {
    id: "s2",
    device: "Safari on iPhone",
    location: "Bangkok, TH",
    lastSeen: "2026-08-12 21:03",
    current: false,
  },
]

export type UserActivity = {
  id: string
  title: string
  description: string
  timestamp: string
}

export const userActivities: UserActivity[] = [
  {
    id: "a1",
    title: "Published a post",
    description: "Getting started with the new editor",
    timestamp: "2026-08-15 09:20",
  },
  {
    id: "a2",
    title: "Updated profile",
    description: "Changed display name and bio",
    timestamp: "2026-08-12 14:02",
  },
  {
    id: "a3",
    title: "Commented on a post",
    description: "Re: Roadmap for Q3",
    timestamp: "2026-08-09 10:41",
  },
  {
    id: "a4",
    title: "Signed in",
    description: "Chrome on macOS · Bangkok, TH",
    timestamp: "2026-08-09 10:12",
  },
]
