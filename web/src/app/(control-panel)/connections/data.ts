export type ConnectionScope =
  | "posts:read"
  | "categories:read"
  | "tags:read"
  | "media:read"

export const allScopes: { value: ConnectionScope; label: string }[] = [
  { value: "posts:read", label: "Posts" },
  { value: "categories:read", label: "Categories" },
  { value: "tags:read", label: "Tags" },
  { value: "media:read", label: "Media" },
]

export type ConnectionStatus = "Active" | "Revoked" | "Expired"

export type Connection = {
  id: string
  name: string
  domain: string
  /** Public part of the credential — safe to display and copy. */
  keyId: string
  /** Last 4 characters of the secret, all we keep after issuing it. */
  secretLast4: string
  scopes: ConnectionScope[]
  status: ConnectionStatus
  createdAt: string
  expiresAt: string | null
  lastUsedAt: string | null
  requests30d: number
}

export const connections: Connection[] = [
  {
    id: "1",
    name: "Marketing site",
    domain: "www.aprilpollo.com",
    keyId: "ap_live_7f3c9a21",
    secretLast4: "4d21",
    scopes: ["posts:read", "categories:read", "tags:read", "media:read"],
    status: "Active",
    createdAt: "2025-11-04",
    expiresAt: "2026-11-04",
    lastUsedAt: "2026-08-16 08:12",
    requests30d: 184320,
  },
  {
    id: "2",
    name: "Docs portal",
    domain: "docs.aprilpollo.com",
    keyId: "ap_live_b18e4402",
    secretLast4: "9c07",
    scopes: ["posts:read", "categories:read"],
    status: "Active",
    createdAt: "2026-02-18",
    expiresAt: "2026-09-12",
    lastUsedAt: "2026-08-15 22:40",
    requests30d: 42110,
  },
  {
    id: "3",
    name: "Partner blog — Nimbus",
    domain: "blog.nimbus.io",
    keyId: "ap_live_5d0a77f1",
    secretLast4: "1a83",
    scopes: ["posts:read"],
    status: "Active",
    createdAt: "2026-06-01",
    expiresAt: "2026-12-01",
    lastUsedAt: "2026-08-14 19:03",
    requests30d: 9870,
  },
  {
    id: "4",
    name: "Mobile app (beta)",
    domain: "app.aprilpollo.com",
    keyId: "ap_live_c93b1d55",
    secretLast4: "77b2",
    scopes: ["posts:read", "media:read"],
    status: "Expired",
    createdAt: "2025-08-01",
    expiresAt: "2026-08-01",
    lastUsedAt: "2026-07-30 11:22",
    requests30d: 0,
  },
  {
    id: "5",
    name: "Old landing page",
    domain: "legacy.aprilpollo.com",
    keyId: "ap_live_2ac6e130",
    secretLast4: "0f4e",
    scopes: ["posts:read"],
    status: "Revoked",
    createdAt: "2025-03-22",
    expiresAt: null,
    lastUsedAt: "2026-04-09 07:55",
    requests30d: 0,
  },
  {
    id: "6",
    name: "Newsletter builder",
    domain: "mail.aprilpollo.com",
    keyId: "ap_live_a41f8b62",
    secretLast4: "62da",
    scopes: ["posts:read", "media:read"],
    status: "Active",
    createdAt: "2026-01-09",
    expiresAt: "2027-01-09",
    lastUsedAt: "2026-08-16 06:00",
    requests30d: 5120,
  },
  {
    id: "7",
    name: "Help center",
    domain: "help.aprilpollo.com",
    keyId: "ap_live_63d20e8a",
    secretLast4: "3b19",
    scopes: ["posts:read", "categories:read", "tags:read"],
    status: "Active",
    createdAt: "2025-12-14",
    expiresAt: "2026-12-14",
    lastUsedAt: "2026-08-15 18:27",
    requests30d: 21440,
  },
  {
    id: "8",
    name: "Partner blog — Kite",
    domain: "stories.kite.co",
    keyId: "ap_live_9e17c4b0",
    secretLast4: "a70c",
    scopes: ["posts:read"],
    status: "Active",
    createdAt: "2026-03-30",
    expiresAt: "2026-09-05",
    lastUsedAt: "2026-08-13 09:14",
    requests30d: 3260,
  },
  {
    id: "9",
    name: "Status page",
    domain: "status.aprilpollo.com",
    keyId: "ap_live_18ba5c77",
    secretLast4: "cc48",
    scopes: ["posts:read"],
    status: "Active",
    createdAt: "2026-05-20",
    expiresAt: null,
    lastUsedAt: "2026-08-16 05:31",
    requests30d: 1180,
  },
  {
    id: "10",
    name: "Internal search indexer",
    domain: "search.aprilpollo.com",
    keyId: "ap_live_4f0d9128",
    secretLast4: "e5f1",
    scopes: ["posts:read", "categories:read", "tags:read", "media:read"],
    status: "Active",
    createdAt: "2025-10-02",
    expiresAt: "2026-10-02",
    lastUsedAt: "2026-08-16 04:00",
    requests30d: 64300,
  },
  {
    id: "11",
    name: "Conference microsite",
    domain: "summit.aprilpollo.com",
    keyId: "ap_live_7b62aa04",
    secretLast4: "12ef",
    scopes: ["posts:read", "media:read"],
    status: "Expired",
    createdAt: "2025-06-11",
    expiresAt: "2026-06-11",
    lastUsedAt: "2026-06-10 20:02",
    requests30d: 0,
  },
  {
    id: "12",
    name: "Agency preview",
    domain: "preview.northwind.agency",
    keyId: "ap_live_ee3941d7",
    secretLast4: "8a25",
    scopes: ["posts:read"],
    status: "Revoked",
    createdAt: "2026-04-04",
    expiresAt: "2026-10-04",
    lastUsedAt: "2026-05-28 13:46",
    requests30d: 0,
  },
]

export type RequestLogEntry = {
  id: string
  path: string
  status: number
  timestamp: string
}

/** Recent calls shown in the details panel. */
export const requestLog: RequestLogEntry[] = [
  {
    id: "r1",
    path: "GET /api/v1/posts?limit=20",
    status: 200,
    timestamp: "2026-08-16 08:12",
  },
  {
    id: "r2",
    path: "GET /api/v1/posts/getting-started",
    status: 200,
    timestamp: "2026-08-16 08:11",
  },
  {
    id: "r3",
    path: "GET /api/v1/categories",
    status: 200,
    timestamp: "2026-08-16 07:58",
  },
  {
    id: "r4",
    path: "GET /api/v1/media/9182",
    status: 403,
    timestamp: "2026-08-16 07:41",
  },
  {
    id: "r5",
    path: "GET /api/v1/posts?page=2",
    status: 200,
    timestamp: "2026-08-16 07:30",
  },
]

function randomHex(length: number) {
  const bytes = new Uint8Array(Math.ceil(length / 2))
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length)
}

/** Issues a fresh credential. The secret is returned once and never stored. */
export function issueCredential() {
  const keyId = `ap_live_${randomHex(8)}`
  const secret = `aps_${randomHex(32)}`
  return { keyId, secret, secretLast4: secret.slice(-4) }
}

export function expiryFromDays(days: number | null) {
  if (days === null) return null
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function addConnection(input: {
  name: string
  domain: string
  scopes: ConnectionScope[]
  expiresAt: string | null
  keyId: string
  secretLast4: string
}): Connection {
  const nextId = String(
    connections.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
  )
  const connection: Connection = {
    ...input,
    id: nextId,
    status: "Active",
    createdAt: new Date().toISOString().slice(0, 10),
    lastUsedAt: null,
    requests30d: 0,
  }
  connections.push(connection)
  return connection
}
