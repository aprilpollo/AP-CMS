import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";
import { getApiBaseUrl, globalHeaders, setGlobalHeaders } from "@/utils/apiFetch";
import { authRefresh } from "@/auth/api/authApi";

// Resolve the base URL lazily on every request — window.__ENV__ (from config.json)
// may not be populated yet at module-load time.
const rawBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
> = (args, api, extraOptions) =>
  fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    prepareHeaders: (headers) => {
      Object.entries(globalHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      return headers;
    },
  })(args, api, extraOptions);

// Tokens are persisted JSON-stringified (see useLocalStorage).
function readToken(key: string): string | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string) : null;
  } catch {
    return null;
  }
}

// Single-flight refresh so concurrent 401s share one request.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = readToken("refresh_token");
  if (!refreshToken) return null;
  try {
    const res = await authRefresh(refreshToken);
    const data = (await res.json()) as {
      payload: { access_token: string };
    };
    const newToken = data.payload.access_token;
    window.localStorage.setItem("access_token", JSON.stringify(newToken));
    setGlobalHeaders({ Authorization: `Bearer ${newToken}` });
    return newToken;
  } catch {
    return null;
  }
}

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;

    if (newToken) {
      // Retry once with the refreshed token (prepareHeaders reads globalHeaders).
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      window.localStorage.removeItem("access_token");
      window.localStorage.removeItem("refresh_token");
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/sign-in";
      }
    }
  }

  return result;
};

export const apiService = createApi({
  baseQuery,
  endpoints: () => ({}),
  reducerPath: "apiService",
});

export default apiService;
