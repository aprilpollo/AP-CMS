export const getApiBaseUrl = () => {
  return window.__ENV__?.API_BASE_URL || import.meta.env.API_BASE_URL
}

// Define the types for options and configuration
type FetchOptions = RequestInit

export class FetchApiError extends Error {
  status: number

  data: unknown

  constructor(status: number, data: unknown) {
    super(`FetchApiError: ${status}`)
    this.status = status
    this.data = data
  }
}

// Global headers configuration
export const globalHeaders: Record<string, string> = {}

// Function to update global headers
export const setGlobalHeaders = (newHeaders: Record<string, string>) => {
  Object.assign(globalHeaders, newHeaders)
}

export const removeGlobalHeaders = (headerKeys: string[]) => {
  headerKeys.forEach((key) => {
    delete globalHeaders[key]
  })
}

// Main apiFetch function with interceptors and type safety
const apiFetch = async (endpoint: string, options: FetchOptions = {}) => {
  const { headers, ...restOptions } = options
  const method = restOptions.method || "GET"

  const mergedHeaders = new Headers(globalHeaders)
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      mergedHeaders.set(key, value)
    })
  } else if (Array.isArray(headers)) {
    headers.forEach(([key, value]) => {
      mergedHeaders.set(key, value)
    })
  } else if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        mergedHeaders.set(key, value)
      }
    })
  }

  const hasBody = restOptions.body !== undefined && restOptions.body !== null
  const isFormData =
    typeof FormData !== "undefined" && restOptions.body instanceof FormData
  if (
    method !== "GET" &&
    hasBody &&
    !isFormData &&
    !mergedHeaders.has("Content-Type")
  ) {
    mergedHeaders.set("Content-Type", "application/json")
  }

  const config: FetchOptions = {
    headers: mergedHeaders,
    ...restOptions,
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, config)

    if (!response.ok) {
      throw new FetchApiError(response.status, await response.json())
    }

    return response
  } catch (error) {
    console.error("Error in apiFetch:", error)
    throw error
  }
}

export default apiFetch
