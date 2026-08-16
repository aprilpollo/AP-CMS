import { format, subDays } from "date-fns"

export type TrafficPoint = {
  date: string
  views: number
  visitors: number
}

/** Deterministic wave so the mock series stays stable between renders. */
function wave(index: number, base: number, amplitude: number, seed: number) {
  const swing =
    Math.sin((index + seed) / 3) * amplitude +
    Math.cos((index + seed) / 6.5) * amplitude * 0.55
  const trend = index * base * 0.004
  return Math.max(0, Math.round(base + swing + trend))
}

/** 90 days of traffic, oldest first. Pages slice the tail they need. */
export const trafficSeries: TrafficPoint[] = Array.from(
  { length: 90 },
  (_, i) => {
    const day = subDays(new Date(), 89 - i)
    return {
      date: format(day, "MMM d"),
      views: wave(i, 4200, 700, 2),
      visitors: wave(i, 2100, 380, 5),
    }
  }
)

export type ContentRow = {
  category: string
  posts: number
}

export const postsByCategory: ContentRow[] = [
  { category: "Product", posts: 34 },
  { category: "Engineering", posts: 27 },
  { category: "Design", posts: 19 },
  { category: "Company", posts: 12 },
  { category: "Support", posts: 8 },
]

export type RecentPost = {
  id: string
  title: string
  status: "Published" | "Draft" | "Scheduled"
  author: string
  views: number
  date: string
}

export const recentPosts: RecentPost[] = [
  {
    id: "1",
    title: "Getting started with the new editor",
    status: "Published",
    author: "Sarah Chen",
    views: 4820,
    date: "2026-08-15",
  },
  {
    id: "2",
    title: "Release notes — August",
    status: "Published",
    author: "Alex Thompson",
    views: 3105,
    date: "2026-08-13",
  },
  {
    id: "3",
    title: "Designing accessible tables",
    status: "Scheduled",
    author: "Maria Garcia",
    views: 0,
    date: "2026-08-19",
  },
  {
    id: "4",
    title: "How we migrated our media library",
    status: "Draft",
    author: "James Wilson",
    views: 0,
    date: "2026-08-11",
  },
  {
    id: "5",
    title: "A field guide to content modelling",
    status: "Published",
    author: "Sarah Chen",
    views: 2264,
    date: "2026-08-08",
  },
]

export type ActivityEntry = {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
}

export const recentActivity: ActivityEntry[] = [
  {
    id: "a1",
    actor: "Sarah Chen",
    action: "published",
    target: "Getting started with the new editor",
    timestamp: "2026-08-15 09:20",
  },
  {
    id: "a2",
    actor: "Alex Thompson",
    action: "invited",
    target: "nina.p@company.com",
    timestamp: "2026-08-14 16:02",
  },
  {
    id: "a3",
    actor: "Maria Garcia",
    action: "commented on",
    target: "Roadmap for Q3",
    timestamp: "2026-08-14 11:31",
  },
  {
    id: "a4",
    actor: "James Wilson",
    action: "uploaded",
    target: "12 media files",
    timestamp: "2026-08-13 15:47",
  },
  {
    id: "a5",
    actor: "Sarah Chen",
    action: "updated",
    target: "Designing accessible tables",
    timestamp: "2026-08-12 10:05",
  },
]
