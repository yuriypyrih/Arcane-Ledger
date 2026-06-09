import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import type { Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const buildId = new Date().toISOString();
const buildVersionText = `arcane-ledger-build:${buildId}`;

function buildVersionPlugin(): Plugin {
  return {
    name: "arcane-ledger-build-version",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.txt",
        source: buildVersionText
      });
    }
  };
}

export default defineConfig({
  define: {
    __ARCANE_LEDGER_BUILD_ID__: JSON.stringify(buildId)
  },
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
    buildVersionPlugin(),
    VitePWA({
      injectRegister: "auto",
      registerType: "prompt",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
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
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,ico,json}"],
        ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^v$/],
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
