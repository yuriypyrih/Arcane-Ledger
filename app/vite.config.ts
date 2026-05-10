import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

// Keep API requests on the same host the frontend was opened from, including LAN previews.
const apiProxy = {
  "/api/v1": {
    target: "http://127.0.0.1:3001",
    changeOrigin: true
  }
};

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5174,
    proxy: apiProxy
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    proxy: apiProxy
  },
  plugins: [
    react(),
    svgr(),
    VitePWA({
      injectRegister: "auto",
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.svg", "icons/icon-512.svg"],
      manifest: {
        name: "DnD Companion",
        short_name: "DnD Companion",
        description: "Offline-first tools for rolling dice, tracking characters, and browsing codex entries.",
        theme_color: "#4b2f1d",
        background_color: "#f4efe6",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: "icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.destination === "" &&
              url.pathname.endsWith(".json") &&
              !url.pathname.startsWith("/api/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "json-assets-cache"
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
});
