import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    host: true,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return
          }

          const parts = id.split("node_modules/")[1].split("/")
          const packageName = parts[0].startsWith("@")
            ? `${parts[0]}/${parts[1]}`
            : parts[0]

          return packageName
        },
      },
    },
  },
})
