import "./support/environment";
import { startTestDatabase } from "./support/database";
import { createTestUser } from "./support/users";

const stopDatabase = await startTestDatabase();
await createTestUser("browser@example.test");
await createTestUser("inspection-owner@example.test");
await createTestUser("inspection-gm@example.test");
const inspectionAdmin = await createTestUser("inspection-admin@example.test");
inspectionAdmin.role = "admin";
await inspectionAdmin.save();
const { createApp } = await import("../src/app");
const server = createApp().listen(4176, "127.0.0.1", () => console.log("Disposable E2E API ready"));
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await stopDatabase();
}
process.once("SIGTERM", () => {
  void stop();
});
process.once("SIGINT", () => {
  void stop();
});
