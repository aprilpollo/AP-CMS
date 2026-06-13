import { Provider } from "react-redux"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import Authentication from "@/auth/Authentication"
import ErrorBoundary from "@/components/error-boundary"
import AppContext from "@/context/AppContext"
import SettingsProvider from "@/settings/context/SettingsProvider"
import Layout from "@/layouts/Layout"
import themeLayouts from "@/layouts/configs/themeLayouts"
import routes from "@/configs/router"
import store from "@/store"

function App() {
  const AppContextValue = {
    routes,
  }
  return (
    <ErrorBoundary>
      <AppContext value={AppContextValue}>
        <Provider store={store}>
          <ThemeProvider defaultTheme="system" storageKey="app-theme">
            <Toaster />
            <TooltipProvider>
              <Authentication>
                <SettingsProvider>
                  <Layout layouts={themeLayouts} />
                </SettingsProvider>
              </Authentication>
            </TooltipProvider>
          </ThemeProvider>
        </Provider>
      </AppContext>
    </ErrorBoundary>
  )
}

export default App
