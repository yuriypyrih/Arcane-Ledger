import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  envDir: "./tests/fixtures/env",
  // Separate from vite.config: unit tests must not install a service worker or emit assets.
  plugins: [react(), svgr()],
  define: { __ARCANE_LEDGER_BUILD_ID__: JSON.stringify("test") },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    restoreMocks: true,
    maxWorkers: 2,
    testTimeout: 15000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/pages/CharactersPage/**/*.{ts,tsx}",
        "src/components/CharactersPage/CharacterSheetPage/**/*.{ts,tsx}",
        "src/characterSync/**/*.ts",
        "src/store/activeCharacterSheetSlice.ts"
      ],
      exclude: ["**/*.d.ts"]
    }
  }
});
