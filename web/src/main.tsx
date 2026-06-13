import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import routes from "@/configs/router";

const container = document.getElementById("app");

if (!container) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(container, {
  onUncaughtError: (error, errorInfo) => {
    console.error("UncaughtError error", error, errorInfo.componentStack);
  },
  onCaughtError: (error, errorInfo) => {
    console.error("Caught error", error, errorInfo.componentStack);
  },
});

const initApp = async () => {
  try {
    const response = await fetch("/config.json");
    const config = await response.json();
    window.__ENV__ = config;
  } catch (error) {
    console.error("Failed to load config.json", error);
    window.__ENV__ = {} as any;
  }

  const router = createBrowserRouter(routes);
  root.render(<RouterProvider router={router} />);
};

initApp();
