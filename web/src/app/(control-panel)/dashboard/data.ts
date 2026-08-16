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

export type QueueItem = {
  id: string
  title: string
  status: "In review" | "Draft" | "Scheduled"
  author: string
  /** Scheduled date for scheduled posts, last edit for the rest. */
  date: string
}

export const publishingQueue: QueueItem[] = [
  {
    id: "1",
    title: "Designing accessible tables",
    status: "Scheduled",
    author: "Maria Garcia",
    date: "2026-08-19 09:00",
  },
  {
    id: "2",
    title: "What's new in the media library",
    status: "Scheduled",
    author: "Sarah Chen",
    date: "2026-08-21 14:00",
  },
  {
    id: "3",
    title: "How we migrated our media library",
    status: "In review",
    author: "James Wilson",
    date: "2026-08-14",
  },
  {
    id: "4",
    title: "Content modelling for teams",
    status: "In review",
    author: "Alex Thompson",
    date: "2026-08-13",
  },
  {
    id: "5",
    title: "Editor shortcuts cheat sheet",
    status: "Draft",
    author: "Sarah Chen",
    date: "2026-08-11",
  },
]

export type PendingComment = {
  id: string
  author: string
  excerpt: string
  post: string
  timestamp: string
}

export const pendingComments: PendingComment[] = [
  {
    id: "c1",
    author: "Kanya S.",
    excerpt: "Does this work with the self-hosted version too?",
    post: "Getting started with the new editor",
    timestamp: "2026-08-15 10:12",
  },
  {
    id: "c2",
    author: "devops_liu",
    excerpt: "The migration script failed on step 3 for me —",
    post: "How we migrated our media library",
    timestamp: "2026-08-14 22:48",
  },
  {
    id: "c3",
    author: "Anna P.",
    excerpt: "Great write-up. Any plans for a Figma plugin?",
    post: "A field guide to content modelling",
    timestamp: "2026-08-14 16:05",
  },
  {
    id: "c4",
    author: "guest_2291",
    excerpt: "buy cheap followers at …",
    post: "Release notes — August",
    timestamp: "2026-08-14 03:31",
  },
]

export const storage = {
  usedGb: 12.4,
  totalGb: 50,
  files: 1284,
}

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
