import { createRoot } from "react-dom/client";
import AppUpdateGate from "../../src/components/AppUpdateGate/AppUpdateGate";
import {
  initializeAppUpdateLifecycle,
  reloadForAppUpdate,
  markAssetLoadFailureUpdateRequired
} from "../../src/lib/appUpdate";
import "../../src/styles/global.css";

// Synthetic drafts exercise navigation/storage without an account or backend.
let draft = localStorage.getItem("update-journey-draft") ?? "";
window.stageUpdateDraft = (value: string) => {
  draft = value;
};
window.addEventListener("pagehide", () => localStorage.setItem("update-journey-draft", draft));
window.runAppUpdate = reloadForAppUpdate;
window.markUpdateAssetFailure = markAssetLoadFailureUpdateRequired;
initializeAppUpdateLifecycle();
createRoot(document.getElementById("root")!).render(
  <>
    <p data-testid="build">{__ARCANE_LEDGER_BUILD_ID__}</p>
    <AppUpdateGate />
  </>
);
