import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { appPwaPlugins } from "../pwa.config";

export default async function buildUpdateJourneys() {
  const output = await mkdtemp(path.join(tmpdir(), "arcane-update-journeys-"));
  process.env.ARCANE_UPDATE_TEST_BUILDS = output;
  const fixtureRoot = fileURLToPath(new URL("./fixtures", import.meta.url));
  for (const buildId of ["A", "B", "C", "legacy"]) {
    const legacy = buildId === "legacy";
    await build({
      configFile: false,
      root: fixtureRoot,
      envDir: fileURLToPath(new URL("../tests/fixtures/env", import.meta.url)),
      publicDir: false,
      logLevel: "error",
      define: { __ARCANE_LEDGER_BUILD_ID__: JSON.stringify(buildId) },
      plugins: [
        react(),
        ...(legacy
          ? [
              VitePWA({
                injectRegister: "auto",
                registerType: "prompt",
                manifest: false,
                workbox: {
                  globPatterns: ["**/*.{js,css,html,json}"],
                  navigateFallback: "/index.html"
                }
              })
            ]
          : appPwaPlugins(buildId)),
        {
          name: "update-journey-assets",
          transformIndexHtml: {
            order: "pre",
            handler: (html) => (legacy ? html.replace("/main.tsx", "/legacy.tsx") : html)
          },
          generateBundle() {
            this.emitFile({
              type: "asset",
              fileName: "update-fixture.json",
              source: JSON.stringify({ buildId })
            });
            if (legacy)
              this.emitFile({
                type: "asset",
                fileName: "version.txt",
                source: "arcane-ledger-build:legacy"
              });
          }
        }
      ],
      build: { outDir: path.join(output, buildId), emptyOutDir: true }
    });
  }
  return () => rm(output, { recursive: true, force: true });
}
