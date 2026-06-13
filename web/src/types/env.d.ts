interface Window {
  __ENV__: {
    APP_MODE?: "development" | "production"
    API_BASE_URL?: string
    WS_BASE_URL?: string
    GOOGLE_OAUTH_URL?: string
    GOOGLE_CLIENT_ID?: string
    GOOGLE_REDIRECT_URI?: string
    [key: string]: string | undefined
  }
}
