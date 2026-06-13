/** Extracts a human-readable message from an RTK Query / FetchApiError error. */
export function apiError(e: unknown, fallback = "Something went wrong"): string {
  const err = e as
    | { data?: { error?: string | null; message?: string } }
    | undefined
  return err?.data?.error || err?.data?.message || fallback
}
