import { createServer, type ServerResponse } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

export class UpdateServer {
  release = "A";
  version: string | undefined;
  holdAsset = false;
  failAsset = false;
  staleShell = false;
  failWorker = false;
  heldRequests = 0;
  private held = new Set<() => void>();
  private server = createServer((request, response) => {
    const pathname = new URL(request.url!, "http://localhost").pathname;
    if (pathname === "/version.txt") {
      response.setHeader("Content-Type", "text/plain");
      response.end(`arcane-ledger-build:${this.version ?? this.release}`);
      return;
    }
    if (
      (pathname === "/update-fixture.json" && this.failAsset) ||
      (pathname === "/sw.js" && this.failWorker)
    ) {
      response.writeHead(503).end();
      return;
    }
    const serve = () => this.serve(pathname, response);
    if (pathname === "/update-fixture.json" && this.holdAsset) {
      this.heldRequests++;
      this.held.add(serve);
      response.on("close", () => this.held.delete(serve));
    } else serve();
  });

  private serve(pathname: string, response: ServerResponse) {
    const filename = pathname === "/" ? "index.html" : pathname.slice(1);
    const releases =
      this.staleShell && filename === "index.html"
        ? ["A"]
        : [this.release, "A", "B", "C", "legacy"];
    const file = releases
      .map((release) => path.join(process.env.ARCANE_UPDATE_TEST_BUILDS!, release, filename))
      .find((candidate) => existsSync(candidate));
    if (!file || filename.includes("..")) {
      response.writeHead(404).end();
      return;
    }
    response.setHeader("Cache-Control", "no-store");
    response.setHeader(
      "Content-Type",
      filename.endsWith(".js")
        ? "application/javascript"
        : filename.endsWith(".css")
          ? "text/css"
          : filename.endsWith(".json")
            ? "application/json"
            : "text/html"
    );
    response.end(readFileSync(file));
  }

  async start() {
    await new Promise<void>((resolve) => this.server.listen(0, "127.0.0.1", resolve));
    const address = this.server.address();
    if (!address || typeof address === "string") throw new Error("Missing test server address");
    // A trustworthy localhost subdomain executes the production version checks.
    return `http://ledger.localhost:${address.port}`;
  }

  releaseAssets() {
    this.holdAsset = false;
    for (const serve of this.held) serve();
    this.held.clear();
  }

  async close() {
    this.releaseAssets();
    this.server.closeAllConnections();
    await new Promise<void>((resolve) => this.server.close(() => resolve()));
  }
}
