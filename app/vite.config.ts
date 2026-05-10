import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5174
  },
  preview: {
    host: "0.0.0.0",
    port: 4173
  },
  plugins: [
    react(),
    svgr(),
    VitePWA({
      injectRegister: "auto",
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "icons/icon-192.png",
        "icons/icon-512.png"
      ],
      manifest: {
        name: "Arcane Ledger",
        short_name: "Arcane Ledger",
        description:
          "Offline-first tools for rolling dice, tracking characters, and browsing codex entries.",
        theme_color: "#1b2230",
        background_color: "#111827",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
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
