import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  // Never load developer .env files or register a service worker in deterministic UI tests.
  envDir: "./tests/fixtures/env",
  plugins: [react(), svgr(), VitePWA({ injectRegister: false, devOptions: { enabled: false } })],
  define: { __ARCANE_LEDGER_BUILD_ID__: JSON.stringify("e2e") },
  server: { host: "127.0.0.1", port: 4175, strictPort: true }
});
