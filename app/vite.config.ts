import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { appPwaPlugins } from "./pwa.config";

const buildId = new Date().toISOString();

export default defineConfig({
  define: {
    __ARCANE_LEDGER_BUILD_ID__: JSON.stringify(buildId),
    // Drop SDK diagnostic logging while retaining error reporting and breadcrumbs.
    __SENTRY_DEBUG__: false
  },
  server: {
    host: "0.0.0.0",
    port: 5174
  },
  preview: {
    host: "0.0.0.0",
    port: 4173
  },
  plugins: [react(), svgr(), ...appPwaPlugins(buildId)]
});
