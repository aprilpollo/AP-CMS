import { format, subDays } from "date-fns"

export type SessionPoint = {
  date: string
  sessions: number
}

/** Deterministic wave so the mock series stays stable between renders. */
function wave(index: number, base: number, amplitude: number, seed: number) {
  const swing =
    Math.sin((index + seed) / 3.5) * amplitude +
    Math.cos((index + seed) / 8) * amplitude * 0.5
  const trend = index * base * 0.003
  return Math.max(0, Math.round(base + swing + trend))
}

/** 90 days of sessions, oldest first. The page slices the tail it needs. */
export const sessionSeries: SessionPoint[] = Array.from(
  { length: 90 },
  (_, i) => ({
    date: format(subDays(new Date(), 89 - i), "MMM d"),
    sessions: wave(i, 1650, 300, 3),
  })
)

export type ChannelRow = {
  channel: string
  sessions: number
}

export const channels: ChannelRow[] = [
  { channel: "Organic search", sessions: 18420 },
  { channel: "Direct", sessions: 11250 },
  { channel: "Referral", sessions: 6380 },
  { channel: "Social", sessions: 4110 },
  { channel: "Email", sessions: 2240 },
]

export type DeviceRow = {
  /** Matches a key in the chart config so legend and tooltip can resolve it. */
  device: "desktop" | "mobile" | "tablet"
  label: string
  sessions: number
  fill: string
}

export const devices: DeviceRow[] = [
  {
    device: "desktop",
    label: "Desktop",
    sessions: 24100,
    fill: "var(--color-desktop)",
  },
  {
    device: "mobile",
    label: "Mobile",
    sessions: 15300,
    fill: "var(--color-mobile)",
  },
  {
    device: "tablet",
    label: "Tablet",
    sessions: 3000,
    fill: "var(--color-tablet)",
  },
]

export type PageRow = {
  path: string
  views: number
  avgTime: string
  bounce: number
}

export const topPages: PageRow[] = [
  { path: "/", views: 18240, avgTime: "1:24", bounce: 38 },
  { path: "/blog/getting-started", views: 9120, avgTime: "3:02", bounce: 29 },
  { path: "/pricing", views: 7480, avgTime: "2:11", bounce: 44 },
  { path: "/blog/release-notes-august", views: 5230, avgTime: "2:48", bounce: 33 },
  { path: "/docs/quick-start", views: 4610, avgTime: "4:07", bounce: 21 },
  { path: "/contact", views: 2180, avgTime: "0:52", bounce: 61 },
]

export type ReferrerRow = {
  source: string
  sessions: number
}

export const referrers: ReferrerRow[] = [
  { source: "google.com", sessions: 14210 },
  { source: "news.ycombinator.com", sessions: 3820 },
  { source: "linkedin.com", sessions: 2640 },
  { source: "github.com", sessions: 1930 },
  { source: "x.com", sessions: 1180 },
]
