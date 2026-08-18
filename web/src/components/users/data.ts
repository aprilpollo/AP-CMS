// Mock data for the parts of the user detail page that have no API yet:
// sessions and the activity feed. Everything else on the page is live.

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
