import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

// Run after a production build. Include lazy chunks, the service worker, and copied assets.
const directory = new URL("../dist/", import.meta.url);
const totals = {
  javascript: 0,
  javascriptGzip: 0,
  css: 0,
  cssGzip: 0,
  otherAssets: 0,
  otherAssetsGzip: 0,
  total: 0,
  totalGzip: 0
};

async function measure(url) {
  for (const entry of await readdir(url, { withFileTypes: true })) {
    const child = new URL(entry.name + (entry.isDirectory() ? "/" : ""), url);
    if (entry.isDirectory()) {
      await measure(child);
      continue;
    }
    // Source maps are diagnostic artifacts, not code or assets served to the app.
    if (entry.name.endsWith(".map")) continue;
    const bytes = await readFile(child);
    totals.total += bytes.length;
    totals.totalGzip += gzipSync(bytes).length;
    if (entry.name.endsWith(".js")) {
      totals.javascript += bytes.length;
      totals.javascriptGzip += gzipSync(bytes).length;
    } else if (entry.name.endsWith(".css")) {
      totals.css += bytes.length;
      totals.cssGzip += gzipSync(bytes).length;
    } else {
      totals.otherAssets += bytes.length;
      totals.otherAssetsGzip += gzipSync(bytes).length;
    }
  }
}

try {
  await measure(directory);
  const html = await readFile(new URL("index.html", directory), "utf8");
  const entryFile = html.match(/<script\b[^>]*\bsrc="([^"]+\.js)"/)?.[1];
  if (!entryFile) throw new Error("No JavaScript entry found in dist/index.html.");
  const entryBytes = await readFile(new URL(entryFile.replace(/^\//, ""), directory));
  const initialPaths = [
    ...new Set([...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((match) => match[1]))
  ];
  const initialAssets = await Promise.all(
    initialPaths.map(async (file) => {
      const bytes = await readFile(new URL(file.replace(/^\//, ""), directory));
      return { file, bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
    })
  );
  console.log(
    JSON.stringify(
      {
        directory: fileURLToPath(directory),
        bytes: totals,
        initialAssets,
        initialLoading: {
          bytes: initialAssets.reduce((sum, entry) => sum + entry.bytes, 0),
          gzipBytes: initialAssets.reduce((sum, entry) => sum + entry.gzipBytes, 0)
        },
        mainEntry: {
          file: entryFile,
          bytes: entryBytes.length,
          gzipBytes: gzipSync(entryBytes).length
        }
      },
      null,
      2
    )
  );
} catch (error) {
  console.error("Unable to measure dist; run npm run build first.");
  throw error;
}
